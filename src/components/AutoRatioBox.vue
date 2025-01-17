<script setup lang="ts">
// 自动计算长宽比的盒子
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  /**
   * 宽度（选填）
   */
  width?: number | string;
  /**
   * 高度（选填）
   */
  height?: number | string;
  /**
   * 比例 (height / width)，如果传入ratio，则忽略width和height
   */
  ratio?: number | string | null;
  /**
   * 是否用高度作为基准，默认用宽度
   */
  isY?: boolean;
  /**
   * 是否禁用自动宽高比，禁用后当作普通盒子
   */
  disable?: boolean;
}>(), {
  width: 1,
  height: 1,
  ratio: null,
  isY: false,
  disable: false,
});

const mRatio = computed(() => {
  if (props.ratio) {
    return Number(props.ratio);
  }
  return Number(props.height) / Number(props.width);
});

const percent = computed(() => {
  return (mRatio.value * 100).toFixed(2);
});
</script>

<template>
  <div
    class="auto-ratio-box"
    :class="{ 'auto-ratio-box--max-height': isY }"
    :data-ratio="ratio"
  >
    <svg v-if="isY" class="auto-ratio-box__height-box" :viewBox="`0 0 100 ${percent}`"></svg>
    <div
      v-else-if="!disable"
      class="auto-ratio-box__height-box"
      :style="{ paddingBottom: `${percent}%` }"
    ></div>

    <div class="auto-ratio-box__content" :class="{ 'auto-ratio-box__content--disable': disable }">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auto-ratio-box {
  position: relative;
  width: 100%;
  background-position: center;
  background-size: cover;

  &--max-height {
    width: fit-content;
    height: 100%;

    .auto-ratio-box__height-box {
      height: 100%;
    }
  }

  &__height-box {
    // 用于计算比例的盒子
  }

  &__content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    &--disable {
      position: unset;
      top: unset;
      left: unset;
      right: unset;
      bottom: unset;
    }
  }
}
</style>
