#!/usr/bin/env python3
"""
调试脚本 - 查看页面实际状态
"""

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({'width': 1920, 'height': 1080})
    
    # 访问页面
    page.goto('http://localhost:5173/disclosure')
    page.wait_for_load_state('networkidle')
    
    # 截图
    page.screenshot(path='/tmp/debug_page.png', full_page=True)
    print("截图已保存到 /tmp/debug_page.png")
    
    # 获取页面内容
    content = page.content()
    with open('/tmp/debug_page.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("HTML已保存到 /tmp/debug_page.html")
    
    # 检查是否有错误
    console_messages = []
    page.on("console", lambda msg: console_messages.append(msg.text))
    
    # 刷新页面捕获console日志
    page.reload()
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    
    print("\n控制台日志:")
    for msg in console_messages:
        print(f"  {msg}")
    
    # 检查页面标题
    title = page.title()
    print(f"\n页面标题: {title}")
    
    # 检查body内容
    body_text = page.locator('body').text_content()
    print(f"\nBody文本内容前200字符:")
    print(body_text[:200] if body_text else "无内容")
    
    browser.close()
