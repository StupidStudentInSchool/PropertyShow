<template>
  <view class="app">
    <slot />
  </view>
</template>

<script>
export default {
  onLaunch: function() {
    console.log('App Launch');
  },
  onShow: function() {
    console.log('App Show');
  },
  onHide: function() {
    console.log('App Hide');
  }
};
</script>

<style lang="scss">
/*每个页面公共 css*/
@import './styles/common.scss';

page {
  background-color: #f5f5f5;
  font-size: 28rpx;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
