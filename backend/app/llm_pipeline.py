import os
import re
import json
import google.generativeai as genai
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class LLMPipeline:
    def __init__(self):
        self.model = genai.GenerativeModel("models/gemini-2.5-flash") if api_key else None

    def analyze_log(self, text: str) -> dict:
        """
        Analyze the raw error log to determine the cause and solution.
        """
        if not self.model:
            return {"error": "LLM API Key not configured."}
        
        # Preprocessing: limit log length
        text = text[:8000]

        prompt = (
            "あなたはシニアエンジニアです。以下のエラーログや実行ログを解析し、トラブルの原因と対応案を出力してください。\n\n"
            "出力形式は必ず以下のキーを持つJSONで返してください:\n"
            "{\n"
            "  \"cause\": \"エラーの根本原因の短い要約（日本語）\",\n"
            "  \"solution\": \"具体的な解決策のステップ（日本語）\",\n"
            "  \"tags\": [\"関連する技術名1\", \"関連技術名2\"]\n"
            "}\n\n"
            f"▼ログ内容:\n{text}\n\n"
            "JSON以外のテキストやMarkdownブロック(```json)は含めないこと。そのままparse可能なJSONを返すこと。"
        )

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(temperature=0)
            )
            raw = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(raw)
        except Exception as e:
            return {"error": f"LLM解析エラー: {str(e)}"}
