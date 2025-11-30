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
            <n-radio value="image">
              <n-space align="center" :size="4">
                <n-icon><ImageOutline /></n-icon>
                <span>图片</span>
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

      <n-form-item v-if="formValue.type === 'image'" label="图片内容" path="imageData">
        <div class="image-paste-area" @paste="handlePaste">
          <div v-if="!imagePreview" class="paste-hint">
            <n-icon size="48" color="#d9d9d9">
              <ImageOutline />
            </n-icon>
            <p>请在此处粘贴图片（Ctrl+V 或 Cmd+V）</p>
            <p class="hint-sub">支持从截图软件、浏览器等粘贴图片</p>
          </div>
          <div v-else class="image-preview">
            <img :src="imagePreview" alt="预览" />
            <n-button text @click="clearImage" class="clear-image-btn">
              <template #icon>
                <n-icon size="18"><CloseOutline /></n-icon>
              </template>
              清除图片
            </n-button>
          </div>
        </div>
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
import { DocumentAttachOutline, ImageOutline, TextOutline } from "@/utils/icons";
import { Close as CloseOutline } from "@icon-park/vue-next";
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
  type: "text" | "image" | "files";
  textValue: string;
  imageData: string;
  filePath: string;
}

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
  submit: [data: { type: "text" | "image" | "files"; value: string | any }];
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const imagePreview = ref("");

const showModal = ref(props.show);

const formValue = ref<FormValue>({
  type: "text",
  textValue: "",
  imageData: "",
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
  imageData: [
    {
      required: true,
      message: "请粘贴图片",
      trigger: ["change"],
      validator: (rule, value) => {
        if (formValue.value.type === "image" && !value) {
          return new Error("请粘贴图片");
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
        imageData: "",
        filePath: "",
      };
      imagePreview.value = "";
    }
  }
);

watch(showModal, (val) => {
  emit("update:show", val);
});

const handleCancel = () => {
  showModal.value = false;
};

// 处理粘贴图片
const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          formValue.value.imageData = dataUrl;
          imagePreview.value = dataUrl;
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  }
};

// 清除图片
const clearImage = () => {
  formValue.value.imageData = "";
  imagePreview.value = "";
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
    } else if (formValue.value.type === "image") {
      emit("submit", {
        type: "image",
        value: formValue.value.imageData,
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

.image-paste-area {
  min-height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--n-color, #18a058);
  }
}

.paste-hint {
  text-align: center;
  color: #999;
  padding: 40px 20px;

  p {
    margin: 12px 0 0 0;
    font-size: 14px;
  }

  .hint-sub {
    font-size: 12px;
    color: #bbb;
    margin-top: 4px;
  }
}

.image-preview {
  position: relative;
  width: 100%;
  padding: 16px;

  img {
    max-width: 100%;
    max-height: 300px;
    display: block;
    margin: 0 auto;
    border-radius: 4px;
  }

  .clear-image-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 6px 12px;
    border-radius: 4px;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  }
}
</style>

