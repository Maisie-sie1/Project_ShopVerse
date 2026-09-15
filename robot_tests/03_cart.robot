*** Settings ***
Resource    resources/common.resource
Suite Setup    เปิดเว็บไซต์    /login
Suite Teardown    ปิดเว็บไซต์

*** Variables ***
${PRODUCT_HREF}    ${EMPTY}

*** Keywords ***
สมัครผู้ใช้ใหม่ผ่าน UI และล็อกอิน
    ${ts}=    Evaluate    str(int(time.time() * 1000))
    ${email}=    Set Variable    cart_${ts}@test.com
    Go To    ${BASE_URL}/register
    กรอกและส่งฟอร์มสมัครสมาชิก    ผู้ทดสอบ Cart    ${email}    ${NEW_PASSWORD}    ${NEW_PASSWORD}
    Wait Until Page Contains Element    xpath=//button[@aria-label='บัญชีผู้ใช้']    timeout=20s

เพิ่มสินค้าชิ้นแรกลงตะกร้า
    Go To    ${BASE_URL}/shop
    Wait Until Page Contains Element    xpath=//a[contains(@href, '/product/')]
    ${href}=    Get Element Attribute    xpath=(//a[contains(@href, '/product/')])[1]    href
    Set Test Variable    ${PRODUCT_HREF}    ${href}
    Go To    ${href}
    Click Button    xpath=//button[contains(., 'เพิ่มลงตะกร้า')]
    # badge แสดงตัวเลข (≥1) หลังเพิ่ม — รอด้วย contains ตัวเลข
    Wait Until Page Contains Element    xpath=//a[@aria-label='ตะกร้าสินค้า']//span[normalize-space()!='']    timeout=20s

*** Test Cases ***
RF-CART-001: เพิ่มสินค้าแล้ว badge แสดง 1
    [Tags]    cart    smoke    critical
    สมัครผู้ใช้ใหม่ผ่าน UI และล็อกอิน
    เพิ่มสินค้าชิ้นแรกลงตะกร้า
    Page Should Contain Element    xpath=//a[@aria-label='ตะกร้าสินค้า']//span[normalize-space()!='']

RF-CART-002: หน้า /cart แสดงสินค้าและเปลี่ยนจำนวนได้
    [Tags]    cart    high
    สมัครผู้ใช้ใหม่ผ่าน UI และล็อกอิน
    เพิ่มสินค้าชิ้นแรกลงตะกร้า
    Go To    ${BASE_URL}/cart
    Wait Until Page Contains Element    xpath=//h1[contains(., 'ตะกร้าสินค้า')]    timeout=10s
    # จำนวนเริ่มต้น 1
    Page Should Contain Element    xpath=//button[@aria-label='เพิ่มจำนวน']/preceding-sibling::span[1][text()='1']
    Click Button    xpath=//button[@aria-label='เพิ่มจำนวน']
    # รอให้จำนวนเปลี่ยนเป็น 2 (ผ่าน API + refresh)
    Wait Until Page Contains Element    xpath=//button[@aria-label='เพิ่มจำนวน']/preceding-sibling::span[1][text()='2']    timeout=15s

RF-CART-003: ลบสินค้าจนตะกร้าว่าง
    [Tags]    cart    high
    สมัครผู้ใช้ใหม่ผ่าน UI และล็อกอิน
    เพิ่มสินค้าชิ้นแรกลงตะกร้า
    Go To    ${BASE_URL}/cart
    Wait Until Page Contains Element    xpath=//h1[contains(., 'ตะกร้าสินค้า')]    timeout=10s
    Click Button    xpath=//button[@aria-label='ลบสินค้า']
    Wait Until Page Contains    ตะกร้าว่างเปล่า    timeout=15s
