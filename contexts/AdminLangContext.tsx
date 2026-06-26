"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AdminLang = "en" | "zh";

interface AdminLangContextType {
  lang: AdminLang;
  setLang: (lang: AdminLang) => void;
  t: (key: string) => string;
}

const AdminLangContext = createContext<AdminLangContextType | null>(null);

const messages: Record<AdminLang, Record<string, Record<string, string>>> = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      search: "Search",
      loading: "Loading...",
      confirmDelete: "Are you sure you want to delete?",
      success: "Success",
      error: "Error",
      actions: "Actions",
      back: "Back",
      yes: "Yes",
      no: "No",
    },
    login: {
      title: "Admin Login",
      password: "Password",
      submit: "Login",
      invalidPassword: "Invalid password",
    },
    nav: {
      providers: "Providers",
      models: "Models",
      featured: "Featured",
      benchmarks: "Benchmarks",
      logout: "Logout",
      admin: "Admin",
    },
    provider: {
      title: "Provider Management",
      createNew: "New Provider",
      editProvider: "Edit Provider",
      id: "ID",
      name: "Name",
      website: "Website",
      logoFormat: "Logo Format",
      modelCount: "Models",
      deleteConfirm: "Delete this provider? All associated models will also be deleted.",
    },
    model: {
      title: "Model Management",
      createNew: "New Model",
      editModel: "Edit Model",
      id: "Model ID",
      name: "Name",
      provider: "Provider",
      category: "Category",
      contextWindow: "Context Window",
      maxOutput: "Max Output",
      deprecated: "Deprecated",
      releaseDate: "Release Date",
      knowledgeCutoff: "Knowledge Cutoff",
      cacheRate: "Cache Rate (%)",
      notes: "Notes",
      capabilities: "Capabilities",
      pricing: "Pricing",
      addPricing: "Add Pricing",
      pricingType: "Type",
      tier: "Tier",
      price: "Price",
      unit: "Unit",
      removePricing: "Remove",
    },
    featured: {
      title: "Featured Models",
      description: "Drag to reorder featured models",
      available: "Available Models",
      featured: "Featured Models",
      add: "Add to Featured",
      remove: "Remove",
    },
    benchmark: {
      title: "Benchmark Management",
      createNew: "New Benchmark",
      editBenchmark: "Edit Benchmark",
      name: "Name",
      description: "Description",
      sortOrder: "Sort Order",
      results: "Results",
      modelName: "Model Name",
      provider: "Provider",
      score: "Score",
      rank: "Rank",
      addResult: "Add Result",
    },
    category: {
      general: "General",
      llm: "LLM",
      embedding: "Embedding",
      audio: "Audio",
      image: "Image",
      video: "Video",
      moderation: "Moderation",
    },
    filters: {
      allProviders: "All Providers",
    },
    capability: {
      text: "Text",
      vision: "Vision",
      "image-gen": "Image Gen",
      code: "Code",
      "function-call": "Function Call",
      "json-mode": "JSON Mode",
      streaming: "Streaming",
      batch: "Batch",
      "fine-tuning": "Fine-tuning",
      realtime: "Realtime",
    },
    pricingType: {
      token_input: "Input Tokens",
      token_output: "Output Tokens",
      token_cached: "Cached Input",
      embedding: "Embedding",
      per_image: "Per Image",
      per_second: "Per Second",
      per_minute: "Per Minute",
      per_character: "Per Character",
      per_unit: "Per Unit",
    },
  },
  zh: {
    common: {
      save: "保存",
      cancel: "取消",
      delete: "删除",
      edit: "编辑",
      create: "创建",
      search: "搜索",
      loading: "加载中...",
      confirmDelete: "确定要删除吗？",
      success: "成功",
      error: "错误",
      actions: "操作",
      back: "返回",
      yes: "是",
      no: "否",
    },
    login: {
      title: "管理员登录",
      password: "密码",
      submit: "登录",
      invalidPassword: "密码错误",
    },
    nav: {
      providers: "厂商管理",
      models: "模型管理",
      featured: "推荐模型",
      benchmarks: "基准测试",
      logout: "退出登录",
      admin: "后台管理",
    },
    provider: {
      title: "厂商管理",
      createNew: "新建厂商",
      editProvider: "编辑厂商",
      id: "ID",
      name: "名称",
      website: "官网",
      logoFormat: "Logo 格式",
      modelCount: "模型数量",
      deleteConfirm: "确定删除该厂商吗？所有关联的模型也会被删除。",
    },
    model: {
      title: "模型管理",
      createNew: "新建模型",
      editModel: "编辑模型",
      id: "模型 ID",
      name: "名称",
      provider: "厂商",
      category: "类别",
      contextWindow: "上下文窗口",
      maxOutput: "最大输出",
      deprecated: "已弃用",
      releaseDate: "发布日期",
      knowledgeCutoff: "知识截止日期",
      cacheRate: "缓存率 (%)",
      notes: "备注",
      capabilities: "能力",
      pricing: "定价",
      addPricing: "添加定价",
      pricingType: "类型",
      tier: "层级",
      price: "价格",
      unit: "单位",
      removePricing: "移除",
    },
    featured: {
      title: "推荐模型",
      description: "拖拽调整推荐模型顺序",
      available: "可用模型",
      featured: "推荐列表",
      add: "添加推荐",
      remove: "移除",
    },
    benchmark: {
      title: "基准测试管理",
      createNew: "新建基准测试",
      editBenchmark: "编辑基准测试",
      name: "名称",
      description: "描述",
      sortOrder: "排序",
      results: "结果",
      modelName: "模型名称",
      provider: "厂商",
      score: "分数",
      rank: "排名",
      addResult: "添加结果",
    },
    category: {
      general: "通用模型",
      llm: "大语言模型",
      embedding: "嵌入模型",
      audio: "音频模型",
      image: "图像模型",
      video: "视频模型",
      moderation: "内容审核",
    },
    filters: {
      allProviders: "全部厂商",
    },
    capability: {
      text: "文本",
      vision: "视觉",
      "image-gen": "图像生成",
      code: "代码",
      "function-call": "函数调用",
      "json-mode": "JSON 模式",
      streaming: "流式输出",
      batch: "批量处理",
      "fine-tuning": "微调",
      realtime: "实时",
    },
    pricingType: {
      token_input: "输入 Token",
      token_output: "输出 Token",
      token_cached: "缓存输入",
      embedding: "嵌入",
      per_image: "每张图片",
      per_second: "每秒",
      per_minute: "每分钟",
      per_character: "每字符",
      per_unit: "每单位",
    },
  },
};

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("admin_lang") as AdminLang;
    if (saved && (saved === "en" || saved === "zh")) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: AdminLang) => {
    setLangState(newLang);
    localStorage.setItem("admin_lang", newLang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    if (keys.length !== 2) return key;
    const [category, name] = keys;
    return messages[lang]?.[category]?.[name] || key;
  };

  return (
    <AdminLangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang() {
  const context = useContext(AdminLangContext);
  if (!context)
    throw new Error("useAdminLang must be used within AdminLangProvider");
  return context;
}
