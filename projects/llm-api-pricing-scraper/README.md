# LLM API 价格爬取任务

这是一个独立小项目，用于定时抓取主流大模型 API 的官方价格页，并将结果落地为 JSON。

## 当前覆盖

- OpenAI API Pricing
- Anthropic API Pricing
- Google Gemini API Pricing

> 说明：价格页面结构变化较快，当前版本使用规则匹配（regex + HTML 文本提取），如果匹配失败会写入 `errors` 字段。

## 使用方式

```bash
python3 -m pip install -r projects/llm-api-pricing-scraper/requirements.txt
python3 projects/llm-api-pricing-scraper/src/scrape_prices.py
```

默认输出：

- `projects/llm-api-pricing-scraper/data/prices.json`

可自定义输出路径：

```bash
python3 projects/llm-api-pricing-scraper/src/scrape_prices.py \
  --output /tmp/llm-prices.json
```

## 输出结构

```json
{
  "generated_at_utc": "2026-03-27T00:00:00+00:00",
  "record_count": 3,
  "records": [
    {
      "provider": "openai",
      "model": "GPT-4.1",
      "input_usd_per_1m_tokens": 2.0,
      "output_usd_per_1m_tokens": 8.0,
      "source": "https://openai.com/api/pricing/"
    }
  ],
  "errors": []
}
```

## 仓库自动任务（GitHub Actions）

已提供每日定时任务：`.github/workflows/update-llm-prices.yml`

- UTC 每天 02:00 自动抓取
- 支持手动触发 (`workflow_dispatch`)
- 将最新 JSON 自动提交回仓库
