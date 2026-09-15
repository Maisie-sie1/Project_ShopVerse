*** Settings ***
Resource    resources/common.resource
Suite Setup    ตั้งค่า Checkout Suite
Suite Teardown    ปิดเว็บไซต์

*** Keywords ***
ตั้งค่า Checkout Suite
    Create Session    shop    ${BASE_URL}    disable_warnings=True
    เปิดเว็บไซต์    /login

*** Keywords ***
ล็อกอินลูกค้าใหม่ผ่าน API และเปิดเว็บ
    ${email}=    สมัครสมาชิกผ่าน API และล็อกอิน    name=RF Checkout
    # logout API session เพื่อเปิด browser ใหม่ด้วยบัญชีที่สมัคร
    Go To    ${BASE_URL}/register
    Wait Until Page Contains    สมัครสมาชิก    timeout=10s

เพิ่มสินค้าแรกในตะกร้าผ่าน UI
    Go To    ${BASE_URL}/shop
    Wait Until Page Contains Element    xpath=//a[contains(@href, '/product/')]
    ${href}=    Get Element Attribute    xpath=(//a[contains(@href, '/product/')])[1]    href
    Go To    ${href}
    Click Button    xpath=//button[contains(., 'เพิ่มลงตะกร้า')]
    Wait Until Page Contains Element    xpath=//a[@aria-label='ตะกร้าสินค้า']//span[contains(text(), '1')]    timeout=15s

*** Test Cases ***
RF-CHK-001: สั่งซื้อแบบเก็บเงินปลายทางสำเร็จ (ใช้ UI + API)
    [Tags]    checkout    e2e    critical
    # เตรียม user ใหม่ผ่าน API (เร็วกว่า UI)
    ${email}=    สมัครสมาชิกผ่าน API และล็อกอิน    name=RF Checkout
    # เปิด browser และ login ด้วย user ใหม่นี้ผ่าน UI
    Open Browser    ${BASE_URL}/login    ${BROWSER}    headless=${HEADLESS}
    Set Window Size    1280    900
    Input Text    id=email    ${email}
    Input Text    id=password    ${NEW_PASSWORD}
    Click Button    เข้าสู่ระบบ
    Wait Until Page Contains Element    xpath=//button[@aria-label='บัญชีผู้ใช้']    timeout=15s

    เพิ่มสินค้าแรกในตะกร้าผ่าน UI
    Go To    ${BASE_URL}/checkout
    Wait Until Page Contains Element    xpath=//h1[contains(., 'ชำระเงิน')]    timeout=10s
    Input Text    id=fullName    ผู้ทดสอบ RF
    Input Text    id=phone    0812345678
    Input Text    id=line1    12/34 ถ.สุขุมวิท
    Input Text    id=city    วัฒนา
    Input Text    id=state    กรุงเทพมหานคร
    Input Text    id=postalCode    10110
    Click Button    xpath=//button[contains(., 'ยืนยันการสั่งซื้อ')]
    # ควร redirect ไป order detail
    Wait Until Location Contains    /account/orders/    timeout=20s
    Page Should Contain Element    xpath=//h1[contains(., 'ORD-')]
    Page Should Contain    เก็บเงินปลายทาง

RF-CHK-002: ไม่กรอกที่อยู่ กดยืนยัน → ยังอยู่ /checkout (validation)
    [Tags]    checkout    negative    high
    ${email}=    สมัครสมาชิกผ่าน API และล็อกอิน    name=RF Checkout 2
    Open Browser    ${BASE_URL}/login    ${BROWSER}    headless=${HEADLESS}
    Input Text    id=email    ${email}
    Input Text    id=password    ${NEW_PASSWORD}
    Click Button    เข้าสู่ระบบ
    Wait Until Page Contains Element    xpath=//button[@aria-label='บัญชีผู้ใช้']    timeout=15s
    เพิ่มสินค้าแรกในตะกร้าผ่าน UI
    Go To    ${BASE_URL}/checkout
    Wait Until Page Contains Element    xpath=//h1[contains(., 'ชำระเงิน')]    timeout=10s
    Click Button    xpath=//button[contains(., 'ยืนยันการสั่งซื้อ')]
    Location Should Contain    /checkout
