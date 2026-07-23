"""
LLMClient — 模型调用统一接口
==============================
设计方案 §6.1：Agent 调用层抽象成接口，模型名/密钥/baseURL 全走 config 环境变量。
切换模型只改 .env 不改代码。

所有 Agent 代码通过 LLMClient.chat() 调用，不直接引用模型名。
读代码时一眼能看出"这里调了 LLM，模型由配置决定"。

面向低成本模型优化（§6.1 约束4）：
- 指令明确、步骤拆细、少零样本推理
- 结构化输出优先（JSON），便于解析
- 单轮任务为主，多轮对话控制上下文长度
"""

import json
import os
from typing import Optional
from dataclasses import dataclass

import httpx

from app.config import get_settings


@dataclass
class LLMMessage:
    """单条消息"""
    role: str  # "system" | "user" | "assistant"
    content: str


@dataclass
class LLMResponse:
    """LLM 响应"""
    content: str
    model: str
    usage: Optional[dict] = None

    def json(self) -> dict:
        """
        尝试解析为 JSON（结构化输出场景）。
        三级兜底：
        1. 直接解析（含 ```json 标记剥离）
        2. 正则提取 JSON 块（大括号匹配）
        3. 返回空字典，交由调用方做最后兜底
        """
        import re

        text = self.content.strip()

        # 第一级：直接尝试（含常见 markdown 代码块剥离）
        try:
            cleaned = text
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            if cleaned:
                return json.loads(cleaned)
        except (json.JSONDecodeError, ValueError):
            pass

        # 第二级：正则提取 JSON 对象（{...} 匹配，处理嵌套大括号）
        try:
            # 找到第一个 { 和最后一个 } 之间的内容（含嵌套）
            brace_depth = 0
            start = -1
            for i, ch in enumerate(text):
                if ch == '{':
                    if brace_depth == 0:
                        start = i
                    brace_depth += 1
                elif ch == '}':
                    brace_depth -= 1
                    if brace_depth == 0 and start >= 0:
                        candidate = text[start:i+1]
                        try:
                            return json.loads(candidate)
                        except (json.JSONDecodeError, ValueError):
                            # 找到的块可能不是完整 JSON，继续
                            pass
        except Exception:
            pass

        # 第三级：完全解析失败
        return {}


class LLMClient:
    """
    LLM 统一调用接口
    
    用法:
        client = LLMClient()
        resp = client.chat("你是一个 LOL 电竞分析师...", "分析这场 BO3 的胜负手")
        data = resp.json()  # 结构化输出
    
    设计约束（§6.1）:
    - 模型名/密钥/baseURL 全走环境变量
    - 不硬编码任何模型名
    - 切换模型只改 .env
    """

    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ):
        settings = get_settings()
        self.model = model or settings.LLM_MODEL or "unknown"
        self.api_key = api_key or settings.LLM_API_KEY or ""
        self.base_url = (base_url or settings.LLM_BASE_URL or "https://api.openai.com/v1").rstrip("/")
        self.temperature = temperature
        self.max_tokens = max_tokens

    def chat(
        self,
        system_prompt: str,
        user_message: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> LLMResponse:
        """
        单轮对话调用（面向低成本模型优化：单轮为主）
        
        Args:
            system_prompt: 系统提示词（从 agents/prompts/*.txt 加载）
            user_message: 用户输入
            temperature: 覆盖默认温度
            max_tokens: 覆盖默认最大 token
            
        Returns:
            LLMResponse
        """
        if not self.api_key:
            # 开发模式：无 API key 时返回空响应（不阻塞开发）
            return LLMResponse(
                content='{"error": "LLM_API_KEY not configured", "fallback": true}',
                model=self.model,
            )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]

        try:
            with httpx.Client(timeout=60.0) as client:
                resp = client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": temperature or self.temperature,
                        "max_tokens": max_tokens or self.max_tokens,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return LLMResponse(
                    content=content,
                    model=data.get("model", self.model),
                    usage=data.get("usage"),
                )
        except Exception as e:
            return LLMResponse(
                content=f'{{"error": "{str(e)}"}}',
                model=self.model,
            )

    def chat_multi(
        self,
        system_prompt: str,
        messages: list[LLMMessage],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> LLMResponse:
        """
        多轮对话调用（长期复盘场景需要多轮）
        
        Args:
            system_prompt: 系统提示词
            messages: 对话历史
            temperature: 覆盖默认温度
            max_tokens: 覆盖默认最大 token
        """
        if not self.api_key:
            return LLMResponse(
                content='{"error": "LLM_API_KEY not configured", "fallback": true}',
                model=self.model,
            )

        msg_list = [{"role": "system", "content": system_prompt}]
        for m in messages:
            msg_list.append({"role": m.role, "content": m.content})

        try:
            with httpx.Client(timeout=120.0) as client:
                resp = client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": msg_list,
                        "temperature": temperature or self.temperature,
                        "max_tokens": max_tokens or self.max_tokens,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return LLMResponse(
                    content=content,
                    model=data.get("model", self.model),
                    usage=data.get("usage"),
                )
        except Exception as e:
            return LLMResponse(
                content=f'{{"error": "{str(e)}"}}',
                model=self.model,
            )


def load_prompt(name: str) -> str:
    """
    加载 prompt 模板文件（§6.1 约束2：Prompt 与代码分离）
    
    Args:
        name: prompt 文件名（不含路径），如 "split_knowledge.txt"
        
    Returns:
        prompt 内容
    """
    prompt_dir = os.path.join(os.path.dirname(__file__), "prompts")
    filepath = os.path.join(prompt_dir, name)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Prompt 文件不存在: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()
