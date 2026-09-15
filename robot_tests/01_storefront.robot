*** Settings ***
Resource    resources/common.resource
Suite Setup    เปิดเว็บไซต์    /
Suite Teardown    ปิดเว็บไซต์

*** Test Cases ***
RF-STORE-001: หน้าแรกโหลด แสดง hero และสินค้าแนะนำ
    [Tags]    smoke    storefront    critical
    Page Should Contain    ของดีราคาดี
    Page Should Contain Element    xpath=//a[contains(@href, '/product/')][.//img]

RF-STORE-002: กดปุ่มเริ่มช้อปปิ้งไปหน้า /shop
    [Tags]    storefront    high
    Click Element    xpath=//a[contains(., 'เริ่มช้อปปิ้ง')]
    Wait Until Location Contains    /shop    timeout=10s
    Page Should Contain    สินค้าทั้งหมด

RF-STORE-003: เปิดสินค้าจากหน้ารวมแล้วเห็นรายละเอียด
    [Tags]    storefront    critical
    Go To    ${BASE_URL}/shop
    Wait Until Page Contains Element    xpath=//a[contains(@href, '/product/')]
    Click Element    xpath=(//a[contains(@href, '/product/')])[1]
    Wait Until Page Contains Element    xpath=//h1    timeout=10s
    Page Should Contain Element    xpath=//button[contains(., 'เพิ่มลงตะกร้า') or contains(., 'สินค้าหมด')]

RF-STORE-004: ค้นหาสินค้าคำว่า กาแฟ
    [Tags]    storefront    high
    Go To    ${BASE_URL}/shop?search=กาแฟ
    Wait Until Page Contains Element    xpath=//a[contains(@href, '/product/')]
    ${count}=    Get Element Count    xpath=//a[contains(@href, '/product/')]
    Should Be True    ${count} > 0    ควรมีผลการค้นหา
    # alt ของรูป = ชื่อสินค้า ควรมี กาแฟ
    ${alt}=    Get Element Attribute    xpath=(//a[contains(@href, '/product/')]//img)[1]    alt
    Should Contain    ${alt}    กาแฟ
