# Logic for extracting the papers

This is a very basic implementaion of how the [sampleJsonLds](../../sampleJsonLds/20250214_085206_s41586_023_06801_2.json) were created. This needs to be integrated into the [watchFiles.ts](../../src/bioagentPlugin/services/gdrive/watchFiles.ts). Also a lot of the code in that file is outdated, eg. the `evaluateHypothesis` function. Just the logic for watching the GDrive for changes is still relevant.

The challenge is the `keywords` field needs to be handled properly. Basically, when processing different papers, the LLM might generate inconsistent terminology- like using "Alzheimer's disease" for one paper and "AD" for another. To fix this, we'll need post-processing that maps these varied terms to standardized keywords. This can get tricky given the inconsistent answers LLMs produce.

I'm currently exploring solutions using either MeSH (Medical Subject Headings) or UMLS (Unified Medical Language System) to handle this using fuzzy matching. Once that is figured out, this is can be safely integrated into the bioagentPlugin
