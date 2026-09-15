*** Settings ***
Library    SeleniumLibrary    timeout=20s    implicit_wait=5s
Library    RequestsLibrary
Library    Collections

*** Variables ***
${BASE_URL}          http://localhost:3000
${BROWSER}           chrome
${HEADLESS}          True
# Seed accounts (จาก prisma/seed.ts)
${ADMIN_EMAIL}       admin@shop.com
${ADMIN_PASSWORD}    admin123
${CUSTOMER_EMAIL}    customer@shop.com
${CUSTOMER_PASSWORD}  customer123
# Runtime vars (set ใน test suite)
${NEW_EMAIL}         ${EMPTY}
${NEW_PASSWORD}      secret123

*** Keywords ***
เปิดเว็บไซต์
    [Arguments]    ${url}=/
    Open Browser    ${BASE_URL}${url}    ${BROWSER}    headless=${HEADLESS}
    Set Window Size    1280    900
    # Title เป็น 'ShopVerse — ...' (มี metadata template) — เช็คแค่ว่าขึ้นต้นถูก
    ${title}=    Get Title
    Should Start With    ${title}    ShopVerse

ปิดเว็บไซต์
    Close All Browsers

# ---------- UI Actions ----------
กรอกและส่งฟอร์มเข้าสู่ระบบ
    [Arguments]    ${email}    ${password}
    Input Text    id=email    ${email}
    Input Text    id=password    ${password}
    Click Button    เข้าสู่ระบบ
    Wait Until Page Contains    บัญชีผู้ใช้    timeout=15s

กรอกและส่งฟอร์มสมัครสมาชิก
    [Arguments]    ${name}    ${email}    ${password}    ${confirm}
    Input Text    id=name    ${name}
    Input Text    id=email    ${email}
    Input Text    id=password    ${password}
    Input Text    id=confirm    ${confirm}
    Click Button    xpath=//button[@type='submit']

# ---------- API Keywords ----------
สร้าง Session API
    [Arguments]    ${email}    ${password}
    Create Session    shop    ${BASE_URL}    disable_warnings=True
    ${data}=    Create Dictionary    email=${email}    password=${password}
    ${resp}=    POST On Session    shop    /api/auth/login    json=${data}
    Should Be Equal As Integers    ${resp.status_code}    200
    RETURN    ${resp}

สมัครสมาชิกผ่าน API และล็อกอิน
    [Arguments]    ${name}=API Tester
    ${ts}=    Evaluate    str(int(time.time() * 1000))
    ${email}=    Set Variable    robot_${ts}@test.com
    ${data}=    Create Dictionary    name=${name}    email=${email}    password=${NEW_PASSWORD}
    ${resp}=    POST On Session    shop    /api/auth/register    json=${data}
    Should Be Equal As Integers    ${resp.status_code}    201
    Set Test Variable    ${NEW_EMAIL}    ${email}
    RETURN    ${email}
