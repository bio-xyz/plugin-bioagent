# ScaiCh Plugin 🤖📚

A plugin for researchers to search literature via SCAI API, process Google Drive documents, and generate biological hypotheses. Integrates with RDF stores like [OriginTrail DKG](https://origintrail.io) or [Oxigraph](https://github.com/oxigraph/oxigraph).

## 🚀 Features

- **Literature Search**: Query SCAI API for scientific articles and store as Knowledge Assets.
- **Google Drive Monitoring**: Auto-process new PDFs into Knowledge Assets.
- **Hypothesis Generation**: Generate and evaluate biological hypotheses, scored by JudgeLLM.

> [!NOTE] Under development. Google Drive webhooks require public URLs (e.g., ngrok).

```
{
  "action": "SCAI_SEARCH",
  "content": "The History of Sci-hub"
}
```

## 📋 Notes

- SCAI API requires no authentication for now.
- Logs: Set `DEFAULT_LOG_LEVEL=debug` in `.env`.
- Issues? Check logs or submit to [GitHub](https://github.com/bio-xyz/plugin-scaich).


