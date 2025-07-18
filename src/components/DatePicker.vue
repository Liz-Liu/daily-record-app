<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">選擇日期</label>
    <input
      type="date"
      :value="modelValue"
      @input="onInput"
      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-400 text-sm"
    />
  </div>
</template>

<script setup lang="ts">

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}
</script>
