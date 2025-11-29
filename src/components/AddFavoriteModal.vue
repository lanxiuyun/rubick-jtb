<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="添加常用数据"
    :style="{ width: '600px' }"
    :bordered="false"
    :segmented="{ content: 'soft' }"
  >
    <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top">
      <n-form-item label="数据类型" path="type">
        <n-radio-group v-model:value="formValue.type">
          <n-space>
            <n-radio value="text">
              <n-space align="center" :size="4">
                <n-icon><TextOutline /></n-icon>
                <span>文本</span>
              </n-space>
            </n-radio>
            <n-radio value="files">
              <n-space align="center" :size="4">
                <n-icon><DocumentAttachOutline /></n-icon>
                <span>文件路径</span>
              </n-space>
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      <n-form-item v-if="formValue.type === 'text'" label="文本内容" path="textValue">
        <n-input
          v-model:value="formValue.textValue"
          type="textarea"
          placeholder="请输入常用文本内容"
          :autosize="{ minRows: 3, maxRows: 8 }"
        />
      </n-form-item>

      <n-form-item v-if="formValue.type === 'files'" label="文件路径" path="filePath">
        <n-input
          v-model:value="formValue.filePath"
          placeholder="例如: C:\Users\Username\Documents\file.txt"
        />
        <template #feedback>
          <span style="font-size: 12px; color: #999;">
            请输入完整的文件或文件夹路径，会自动去除首尾空格和引号
          </span>
        </template>
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          添加到收藏
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { DocumentAttachOutline, TextOutline } from "@/utils/icons";
import {
  NButton,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NRadio,
  NRadioGroup,
  NSpace,
  useMessage,
  type FormInst,
  type FormRules,
} from "naive-ui";
import { ref, watch } from "vue";

interface FormValue {
  type: "text" | "files";
  textValue: string;
  filePath: string;
}

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
  submit: [data: { type: "text" | "files"; value: string | any }];
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

const showModal = ref(props.show);

const formValue = ref<FormValue>({
  type: "text",
  textValue: "",
  filePath: "",
});

const rules: FormRules = {
  textValue: [
    {
      required: true,
      message: "请输入文本内容",
      trigger: ["blur", "input"],
      validator: (rule, value) => {
        if (formValue.value.type === "text" && !value) {
          return new Error("请输入文本内容");
        }
        return true;
      },
    },
  ],
  filePath: [
    {
      required: true,
      message: "请输入文件路径",
      trigger: ["blur", "input"],
      validator: (rule, value) => {
        if (formValue.value.type === "files" && !value) {
          return new Error("请输入文件路径");
        }
        return true;
      },
    },
  ],
};

watch(
  () => props.show,
  (val) => {
    showModal.value = val;
    if (val) {
      // 重置表单
      formValue.value = {
        type: "text",
        textValue: "",
        filePath: "",
      };
    }
  }
);

watch(showModal, (val) => {
  emit("update:show", val);
});

const handleCancel = () => {
  showModal.value = false;
};

// 清理文件路径：去除首尾空格和引号
const cleanFilePath = (path: string): string => {
  let cleaned = path.trim();
  // 去除首尾的双引号或单引号
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    submitting.value = true;

    if (formValue.value.type === "text") {
      emit("submit", {
        type: "text",
        value: formValue.value.textValue,
      });
    } else if (formValue.value.type === "files") {
      const path = cleanFilePath(formValue.value.filePath);
      const name = path.split(/[/\\]/).pop() || "未命名文件";
      
      emit("submit", {
        type: "files",
        value: [
          {
            isFile: true,
            isDirectory: false,
            name,
            path,
          },
        ],
      });
    }

    message.success("添加成功");
    showModal.value = false;
  } catch (error) {
    console.error("表单验证失败", error);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
:deep(.n-form-item-feedback-wrapper) {
  min-height: 0;
}
</style>

