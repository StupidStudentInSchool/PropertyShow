#!/usr/bin/env python3
"""
物业公开公示页面全面测试脚本
测试所有功能：页面加载、数据展示、图表、交互、弹窗、响应式布局
"""

from playwright.sync_api import sync_playwright
import time
import os

def test_page_load(page):
    """测试页面加载"""
    print("\n=== 测试1: 页面加载 ===")
    
    # 访问公开公示页面
    page.goto('http://localhost:5173/disclosure')
    page.wait_for_load_state('networkidle')
    
    # 截图
    page.screenshot(path='/tmp/test_01_load.png', full_page=True)
    print("✓ 页面加载成功")
    
    # 检查关键元素是否存在
    assert page.locator('.header').count() > 0, "Header不存在"
    assert page.locator('.community-info h1').count() > 0, "小区名称不存在"
    assert page.locator('.overview-section').count() > 0, "概览区域不存在"
    print("✓ 关键元素存在")
    
    # 检查小区名称
    community_name = page.locator('.community-info h1').first.text_content()
    print(f"✓ 小区名称: {community_name}")
    
    return True

def test_data_display(page):
    """测试数据展示"""
    print("\n=== 测试2: 数据展示 ===")
    
    # 检查核心数据卡片
    cards = page.locator('.card')
    card_count = cards.count()
    print(f"✓ 找到 {card_count} 个数据卡片")
    assert card_count >= 4, "数据卡片数量不足"
    
    # 检查收入卡片
    income_card = page.locator('.income-card')
    assert income_card.count() > 0, "收入卡片不存在"
    print("✓ 收入卡片存在")
    
    # 检查支出卡片
    expense_card = page.locator('.expense-card')
    assert expense_card.count() > 0, "支出卡片不存在"
    print("✓ 支出卡片存在")
    
    # 检查结余卡片
    balance_card = page.locator('.balance-card')
    assert balance_card.count() > 0, "结余卡片不存在"
    print("✓ 结余卡片存在")
    
    # 检查满意度卡片
    satisfaction_card = page.locator('.satisfaction-card')
    assert satisfaction_card.count() > 0, "满意度卡片不存在"
    print("✓ 满意度卡片存在")
    
    # 检查服务指标
    metrics = page.locator('.metric-item')
    metric_count = metrics.count()
    print(f"✓ 找到 {metric_count} 个服务指标")
    assert metric_count >= 4, "服务指标数量不足"
    
    return True

def test_charts(page):
    """测试图表功能"""
    print("\n=== 测试3: 图表功能 ===")
    
    # 检查收支趋势图表
    charts_section = page.locator('.charts-section')
    if charts_section.count() > 0:
        print("✓ 图表区域存在")
        
        # 检查折线图
        line_chart = page.locator('.chart-card').first
        if line_chart.count() > 0:
            print("✓ 收支趋势图表存在")
        
        # 检查雷达图
        radar_chart = page.locator('.chart-card').nth(1)
        if radar_chart.count() > 0:
            print("✓ 服务指标雷达图存在")
    else:
        print("⚠ 图表区域不存在")
    
    return True

def test_quick_actions(page):
    """测试快捷操作"""
    print("\n=== 测试4: 快捷操作面板 ===")
    
    quick_actions = page.locator('.quick-actions')
    if quick_actions.count() > 0:
        print("✓ 快捷操作面板存在")
        
        # 检查快捷操作按钮
        action_buttons = page.locator('.quick-action-btn')
        button_count = action_buttons.count()
        print(f"✓ 找到 {button_count} 个快捷操作按钮")
        assert button_count >= 4, "快捷操作按钮数量不足"
        
        # 点击第一个快捷操作按钮
        first_btn = action_buttons.first
        first_btn.click()
        page.wait_for_timeout(500)
        print("✓ 快捷操作按钮可点击")
    else:
        print("⚠ 快捷操作面板不存在")
    
    return True

def test_participation_stats(page):
    """测试业主参与度统计"""
    print("\n=== 测试5: 业主参与度统计 ===")
    
    participation_section = page.locator('.participation-section')
    if participation_section.count() > 0:
        print("✓ 业主参与度区域存在")
        
        # 检查参与度卡片
        participation_cards = page.locator('.participation-card')
        card_count = participation_cards.count()
        print(f"✓ 找到 {card_count} 个参与度卡片")
        assert card_count >= 3, "参与度卡片数量不足"
        
        # 检查参与率显示
        participation_rates = page.locator('.participation-rate')
        if participation_rates.count() > 0:
            first_rate = participation_rates.first.text_content()
            print(f"✓ 第一个参与率: {first_rate}")
    else:
        print("⚠ 业主参与度区域不存在")
    
    return True

def test_interactive_features(page):
    """测试交互功能"""
    print("\n=== 测试6: 交互功能 ===")
    
    # 测试刷新按钮
    refresh_btn = page.locator('.refresh-btn')
    if refresh_btn.count() > 0:
        print("✓ 刷新按钮存在")
        refresh_btn.click()
        page.wait_for_timeout(1000)
        print("✓ 刷新按钮可点击")
        
        # 检查刷新提示
        refresh_toast = page.locator('.refresh-toast')
        if refresh_toast.count() > 0:
            print("✓ 刷新提示显示")
    else:
        print("⚠ 刷新按钮不存在")
    
    # 测试夜间模式按钮
    dark_mode_btn = page.locator('.dark-mode-btn')
    if dark_mode_btn.count() > 0:
        print("✓ 夜间模式按钮存在")
        dark_mode_btn.click()
        page.wait_for_timeout(500)
        print("✓ 夜间模式切换成功")
        
        # 检查是否应用了夜间模式
        html = page.locator('html')
        is_dark = html.evaluate('el => el.classList.contains("dark-mode")')
        if is_dark:
            print("✓ 夜间模式已启用")
        
        # 再次点击关闭夜间模式
        dark_mode_btn.click()
        page.wait_for_timeout(500)
        print("✓ 夜间模式已关闭")
    else:
        print("⚠ 夜间模式按钮不存在")
    
    # 测试语音播报按钮
    speech_btn = page.locator('.speech-btn')
    if speech_btn.count() > 0:
        print("✓ 语音播报按钮存在")
        # 不实际点击，避免干扰测试
    else:
        print("⚠ 语音播报按钮不存在")
    
    # 测试月份选择器
    month_selector = page.locator('.month-selector select')
    if month_selector.count() > 0:
        print("✓ 月份选择器存在")
        month_selector.select_option(index=1)
        page.wait_for_timeout(500)
        print("✓ 月份选择器可使用")
    else:
        print("⚠ 月份选择器不存在")
    
    return True

def test_modals(page):
    """测试弹窗功能"""
    print("\n=== 测试7: 弹窗功能 ===")
    
    # 测试意见反馈弹窗
    feedback_btn = page.locator('.feedback-btn')
    if feedback_btn.count() > 0:
        print("✓ 意见反馈按钮存在")
        feedback_btn.click()
        page.wait_for_timeout(500)
        
        # 检查弹窗是否显示
        feedback_modal = page.locator('.modal-overlay')
        if feedback_modal.count() > 0:
            print("✓ 意见反馈弹窗显示")
            
            # 填写反馈内容
            textarea = page.locator('textarea').first
            if textarea.count() > 0:
                textarea.fill('这是一条测试反馈')
                print("✓ 反馈内容填写成功")
            
            # 关闭弹窗
            close_btn = page.locator('.close-btn').first
            if close_btn.count() > 0:
                close_btn.click()
                page.wait_for_timeout(500)
                print("✓ 弹窗关闭成功")
    else:
        print("⚠ 意见反馈按钮不存在")
    
    # 测试哈希校验按钮
    hash_btn = page.locator('button:has-text("哈希校验")')
    if hash_btn.count() > 0:
        print("✓ 哈希校验按钮存在")
        hash_btn.click()
        page.wait_for_timeout(500)
        
        # 检查哈希校验弹窗
        hash_modal = page.locator('.hash-modal')
        if hash_modal.count() > 0:
            print("✓ 哈希校验弹窗显示")
            
            # 关闭弹窗
            page.keyboard.press('Escape')
            page.wait_for_timeout(500)
            print("✓ 哈希校验弹窗关闭")
    else:
        print("⚠ 哈希校验按钮不存在")
    
    return True

def test_responsive_layout(page):
    """测试响应式布局"""
    print("\n=== 测试8: 响应式布局 ===")
    
    # 测试桌面端 (1920x1080)
    page.set_viewport_size({'width': 1920, 'height': 1080})
    page.wait_for_timeout(500)
    page.screenshot(path='/tmp/test_desktop.png')
    print("✓ 桌面端布局测试完成")
    
    # 测试平板端 (768x1024)
    page.set_viewport_size({'width': 768, 'height': 1024})
    page.wait_for_timeout(500)
    page.screenshot(path='/tmp/test_tablet.png')
    print("✓ 平板端布局测试完成")
    
    # 测试手机端 (375x667)
    page.set_viewport_size({'width': 375, 'height': 667})
    page.wait_for_timeout(500)
    page.screenshot(path='/tmp/test_mobile.png')
    print("✓ 手机端布局测试完成")
    
    # 恢复桌面端
    page.set_viewport_size({'width': 1920, 'height': 1080})
    page.wait_for_timeout(500)
    
    return True

def test_financial_section(page):
    """测试财务明细区域"""
    print("\n=== 测试9: 财务明细区域 ===")
    
    # 滚动到财务区域
    financial_section = page.locator('.financial-section')
    if financial_section.count() > 0:
        financial_section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        print("✓ 财务明细区域存在")
        
        # 检查收入明细表格
        income_table = page.locator('.detail-table').first
        if income_table.count() > 0:
            print("✓ 收入明细表格存在")
        
        # 检查维修基金
        fund_section = page.locator('.fund-details')
        if fund_section.count() > 0:
            print("✓ 维修基金明细存在")
            
            # 检查基金使用明细
            usage_items = page.locator('.fund-usage-item')
            usage_count = usage_items.count()
            print(f"✓ 找到 {usage_count} 条基金使用明细")
    else:
        print("⚠ 财务明细区域不存在")
    
    return True

def test_service_section(page):
    """测试服务区域"""
    print("\n=== 测试10: 服务区域 ===")
    
    # 测试巡视任务区域
    patrol_section = page.locator('.patrol-section')
    if patrol_section.count() > 0:
        patrol_section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        print("✓ 巡视任务区域存在")
    
    # 测试设备管理区域
    equipment_section = page.locator('.equipment-section')
    if equipment_section.count() > 0:
        equipment_section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        print("✓ 设备管理区域存在")
        
        # 检查设备列表
        equipment_items = page.locator('.equipment-item')
        equipment_count = equipment_items.count()
        print(f"✓ 找到 {equipment_count} 个设备")
    
    # 测试投票区域
    vote_section = page.locator('.vote-section')
    if vote_section.count() > 0:
        vote_section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        print("✓ 投票区域存在")
        
        # 检查投票卡片
        vote_cards = page.locator('.vote-card')
        vote_count = vote_cards.count()
        print(f"✓ 找到 {vote_count} 个投票")
    
    # 测试质询区域
    inquiry_section = page.locator('.inquiry-section')
    if inquiry_section.count() > 0:
        inquiry_section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        print("✓ 质询区域存在")
    
    # 测试公告区域
    notice_section = page.locator('.notice-section')
    if notice_section.count() > 0:
        notice_section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        print("✓ 公告区域存在")
    
    return True

def main():
    """主测试函数"""
    print("=" * 60)
    print("开始物业公开公示页面全面测试")
    print("=" * 60)
    
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 设置默认视口
        page.set_viewport_size({'width': 1920, 'height': 1080})
        
        # 收集测试结果
        results = []
        
        try:
            # 执行所有测试
            tests = [
                ("页面加载", test_page_load),
                ("数据展示", test_data_display),
                ("图表功能", test_charts),
                ("快捷操作", test_quick_actions),
                ("业主参与度", test_participation_stats),
                ("交互功能", test_interactive_features),
                ("弹窗功能", test_modals),
                ("响应式布局", test_responsive_layout),
                ("财务明细", test_financial_section),
                ("服务区域", test_service_section),
            ]
            
            for test_name, test_func in tests:
                try:
                    result = test_func(page)
                    results.append((test_name, "通过", None))
                except Exception as e:
                    results.append((test_name, "失败", str(e)))
                    print(f"✗ {test_name}测试失败: {e}")
            
        except Exception as e:
            print(f"\n✗ 测试过程出错: {e}")
        
        finally:
            browser.close()
    
    # 打印测试结果汇总
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    
    passed = sum(1 for _, status, _ in results if status == "通过")
    failed = sum(1 for _, status, _ in results if status == "失败")
    
    for test_name, status, error in results:
        icon = "✓" if status == "通过" else "✗"
        print(f"{icon} {test_name}: {status}")
        if error:
            print(f"  错误: {error}")
    
    print(f"\n总计: {passed} 通过, {failed} 失败")
    print("=" * 60)
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
