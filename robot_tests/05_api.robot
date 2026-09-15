*** Settings ***
Resource    resources/common.resource
Suite Setup    Create Session    shop    ${BASE_URL}    disable_warnings=True
Suite Teardown    Delete All Sessions

*** Test Cases ***
RF-API-001: register สำเร็จ → 201, ไม่ leak password hash
    [Tags]    api    auth    critical
    ${ts}=    Evaluate    str(int(time.time() * 1000))
    ${data}=    Create Dictionary    name=Robot Tester    email=robot_${ts}@test.com    password=secret123
    ${resp}=    POST On Session    shop    /api/auth/register    json=${data}    expected_status=201
    ${body}=    Set Variable    ${resp.json()}
    Dictionary Should Contain Key    ${body}    user
    Should Not Contain    ${body}    passwordHash

RF-API-002: register email ซ้ำ → 409
    [Tags]    api    auth    high
    ${data}=    Create Dictionary    name=Dup    email=${CUSTOMER_EMAIL}    password=secret123
    ${resp}=    POST On Session    shop    /api/auth/register    json=${data}    expected_status=409
    Should Be Equal As Integers    ${resp.status_code}    409

RF-API-003: login สำเร็จ → 200
    [Tags]    api    auth    smoke    critical
    ${data}=    Create Dictionary    email=${CUSTOMER_EMAIL}    password=${CUSTOMER_PASSWORD}
    ${resp}=    POST On Session    shop    /api/auth/login    json=${data}    expected_status=200
    ${body}=    Set Variable    ${resp.json()}
    Dictionary Should Contain Item    ${body}[user]    role    CUSTOMER

RF-API-004: login รหัสผิด → 401
    [Tags]    api    auth    negative    high
    ${data}=    Create Dictionary    email=${CUSTOMER_EMAIL}    password=wrongpass
    ${resp}=    POST On Session    shop    /api/auth/login    json=${data}    expected_status=401
    Should Be Equal As Integers    ${resp.status_code}    401

RF-API-005: GET /api/products → 200 + มีสินค้า + pagination
    [Tags]    api    products    critical
    ${resp}=    GET On Session    shop    /api/products    params=pageSize=5    expected_status=200
    ${body}=    Set Variable    ${resp.json()}
    ${count}=    Get Length    ${body}[products]
    Should Be True    ${count} > 0    ควรมีสินค้า
    Should Be Equal As Integers    ${body}[pagination][page]    1

RF-API-006: กรองหมวดหมู่ drinks → เฉพาะหมวดนี้
    [Tags]    api    products    high
    ${resp}=    GET On Session    shop    /api/products    params=category=drinks    expected_status=200
    ${body}=    Set Variable    ${resp.json()}
    FOR    ${p}    IN    @{body}[products]
        Dictionary Should Contain Item    ${p}[category]    slug    drinks
    END

RF-API-007: API ต้อง login ก่อนเรียก cart → 401 (session ใหม่ ไม่มี cookie)
    [Tags]    api    cart    security    critical
    Create Session    anonymous    ${BASE_URL}    disable_warnings=True
    ${resp}=    GET On Session    anonymous    /api/cart    expected_status=401
    Should Be Equal As Integers    ${resp.status_code}    401

RF-API-008: customer เรียก /api/admin/stats → 403
    [Tags]    api    rbac    security    critical
    Create Session    customer_ctx    ${BASE_URL}    disable_warnings=True
    ${data}=    Create Dictionary    email=${CUSTOMER_EMAIL}    password=${CUSTOMER_PASSWORD}
    POST On Session    customer_ctx    /api/auth/login    json=${data}    expected_status=200
    ${resp}=    GET On Session    customer_ctx    /api/admin/stats    expected_status=403
    Should Be Equal As Integers    ${resp.status_code}    403
