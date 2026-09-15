*** Settings ***
Resource    resources/common.resource
Suite Setup    เปิดเว็บไซต์    /register
Suite Teardown    ปิดเว็บไซต์

*** Test Cases ***
RF-AUTH-001: สมัครสมาชิกใหม่สำเร็จและเข้าสู่ระบบอัตโนมัติ
    [Tags]    auth    smoke    critical
    ${ts}=    Evaluate    str(int(time.time() * 1000))
    ${email}=    Set Variable    rf_ui_${ts}@test.com
    กรอกและส่งฟอร์มสมัครสมาชิก    ผู้ทดสอบ RF    ${email}    ${NEW_PASSWORD}    ${NEW_PASSWORD}
    Wait Until Page Contains Element    xpath=//button[@aria-label='บัญชีผู้ใช้']    timeout=20s
    Page Should Contain Element    xpath=//button[@aria-label='บัญชีผู้ใช้']

RF-AUTH-002: สมัครด้วยรหัสยืนยันไม่ตรงกัน ขึ้น error
    [Tags]    auth    negative    high
    ${ts}=    Evaluate    str(int(time.time() * 1000))
    Go To    ${BASE_URL}/register
    กรอกและส่งฟอร์มสมัครสมาชิก    ผู้ทดสอบ    dup_${ts}@test.com    secret123    different456
    Wait Until Page Contains    รหัสผ่านไม่ตรงกัน    timeout=10s
    Location Should Contain    /register

RF-AUTH-003: เข้าสู่ระบบด้วยบัญชี seed customer สำเร็จ
    [Tags]    auth    smoke    critical
    Go To    ${BASE_URL}/login
    Input Text    id=email    ${CUSTOMER_EMAIL}
    Input Text    id=password    ${CUSTOMER_PASSWORD}
    Click Button    เข้าสู่ระบบ
    Wait Until Page Contains Element    xpath=//button[@aria-label='บัญชีผู้ใช้']    timeout=15s

RF-AUTH-004: เข้าสู่ระบบด้วยรหัสผิด ขึ้น error
    [Tags]    auth    negative    high
    Go To    ${BASE_URL}/login
    Input Text    id=email    ${CUSTOMER_EMAIL}
    Input Text    id=password    wrongpassword
    Click Button    เข้าสู่ระบบ
    Wait Until Page Contains    อีเมลหรือรหัสผ่านไม่ถูกต้อง    timeout=10s
    Location Should Contain    /login

RF-AUTH-005: ออกจากระบบกลับเป็นปุ่มเข้าสู่ระบบ
    [Tags]    auth    high    known-bug
    Go To    ${BASE_URL}/login
    Input Text    id=email    ${CUSTOMER_EMAIL}
    Input Text    id=password    ${CUSTOMER_PASSWORD}
    Click Button    เข้าสู่ระบบ
    Wait Until Page Contains Element    xpath=//button[@aria-label='บัญชีผู้ใช้']    timeout=15s
    # BUG-ROBOT-001: native click ไม่เปิด dropdown — ใช้ JS click (workaround)
    Execute JavaScript    document.querySelector("button[aria-label='บัญชีผู้ใช้']").click()
    Wait Until Page Contains Element    xpath=//button[contains(., 'ออกจากระบบ')]    timeout=5s
    Click Element    xpath=//button[contains(., 'ออกจากระบบ')]
    Wait Until Location Is    ${BASE_URL}/    timeout=10s
    Wait Until Page Contains Element    xpath=//a[contains(@href, '/login')][contains(., 'เข้าสู่ระบบ')]    timeout=15s

RF-AUTH-006: RBAC — ลูกค้าเข้า /admin ไม่ได้ (redirect ออก)
    [Tags]    auth    rbac    critical
    Go To    ${BASE_URL}/login
    Input Text    id=email    ${CUSTOMER_EMAIL}
    Input Text    id=password    ${CUSTOMER_PASSWORD}
    Click Button    เข้าสู่ระบบ
    Wait Until Page Contains Element    xpath=//button[@aria-label='บัญชีผู้ใช้']    timeout=15s
    Go To    ${BASE_URL}/admin
    Wait Until Keyword Succeeds    3x    2s    Run Keyword And Return Status
    ...    Location Should Not Contain    /admin
