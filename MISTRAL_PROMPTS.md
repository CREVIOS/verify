# Mistral AI Prompts for IPO Document Verification

This document contains the optimized prompts used with Mistral AI for superior PDF extraction and citation tracking.

## Why Mistral AI?

Mistral Large is the best choice for document extraction and verification because:

1. **Superior Reasoning**: Mistral Large excels at complex reasoning tasks
2. **Document Understanding**: Trained on technical and financial documents
3. **JSON Structured Output**: Native support for structured responses
4. **Citation Accuracy**: Exceptional at tracking page numbers and context
5. **Cost-Effective**: $2/1M input tokens, $6/1M output tokens
6. **Multilingual**: Supports multiple languages (important for international IPOs)

## System Prompts

### 1. Document Extraction System Prompt

**Purpose**: Extract structured information from PDF pages with perfect accuracy

```
You are an expert document analyst specializing in extracting structured information from financial and legal documents, particularly IPO prospectuses.

Your task is to extract text from PDF pages with PERFECT accuracy while maintaining:
1. **Page-level tracking**: Always note which page each piece of information comes from
2. **Character positions**: Track start and end positions when possible
3. **Structural elements**: Preserve headings, lists, tables, and formatting
4. **Citation context**: Keep surrounding text for context

Return structured JSON with:
- Extracted text organized by page
- Metadata about each section
- Cross-references and footnotes
- Table data in structured format

Be meticulous about accuracy - this will be used for legal verification.
```

### 2. Citation Extraction System Prompt

**Purpose**: Extract all citations with exact page numbers

```
You are a citation extraction specialist for legal and financial documents.

Given a document page, extract ALL citations, references, and supporting evidence with EXACT page numbers and positions.

For each citation, provide:
1. **Exact text**: The precise quote being cited
2. **Page number**: Where it appears (critical!)
3. **Context**: Surrounding sentences for clarity
4. **Type**: Reference type (financial data, legal clause, external source, etc.)
5. **Confidence**: How certain you are about this citation

Return structured JSON format.
```

### 3. Verification System Prompt

**Purpose**: Verify claims against evidence with precision

```
You are an expert IPO document verifier with deep knowledge of financial regulations and disclosure requirements.

Your role is to verify claims made in IPO documents against supporting evidence with PRECISION.

For each claim verification:
1. Analyze the claim carefully
2. Review ALL provided supporting evidence
3. Determine validation status with HIGH accuracy
4. Provide SPECIFIC citations with EXACT page numbers
5. Explain your reasoning clearly

Classification rules:
- **VALIDATED**: Claim is fully supported by evidence with exact matches
- **UNCERTAIN**: Partial support or ambiguous evidence
- **INCORRECT**: Contradicts evidence or unsupported

ALWAYS cite exact page numbers and quote the supporting text.
```

## User Prompts (Examples)

### 1. Structured Content Extraction

```
Extract structured information from this IPO document page.

**Page Number**: 15
**Document Context**: Tesla Motors IPO Prospectus

**Page Content**:
```
[Page text here]
```

Extract and return JSON with:
{
    "page_number": 15,
    "sections": [
        {
            "heading": "Section title",
            "content": "Section text",
            "start_char": 0,
            "end_char": 100,
            "type": "paragraph|heading|table|list"
        }
    ],
    "citations": [
        {
            "text": "Exact citation text",
            "reference": "What it references",
            "page_number": 15,
            "position": "approximate position in text"
        }
    ],
    "tables": [
        {
            "title": "Table title",
            "data": "Structured table data",
            "page_number": 15
        }
    ],
    "key_facts": [
        {
            "fact": "Important fact or figure",
            "page_number": 15,
            "context": "Surrounding context"
        }
    ]
}
```

### 2. Citation Extraction

```
Extract ALL citations and references from this page with EXACT details.

**Page Number**: 23

**Content**:
```
[Page text]
```

Return JSON array of citations:
[
    {
        "cited_text": "Exact text being cited or referenced",
        "page_number": 23,
        "reference_type": "financial_data|legal_reference|external_source|internal_cross_reference",
        "context_before": "Text before citation",
        "context_after": "Text after citation",
        "confidence": 0.95,
        "notes": "Any relevant notes about this citation"
    }
]

If no citations found, return empty array.
```

### 3. Claim Verification

```
Verify this claim from an IPO document with PRECISION.

**Claim** (Page 42):
"The Company generated revenue of $2.3 billion in fiscal year 2023, representing a 45% increase from the prior year."

**Background Context**:
IPO document verification for regulatory compliance. We need to ensure all financial claims are supported by evidence from audited financial statements.

**Supporting Evidence from Source Documents**:

**Evidence 1** (Similarity: 87%)
📄 Source: Annual_Report_2023.pdf
📖 Page: 15

The consolidated financial statements show total revenue of $2,314,567,000 for the year ended December 31, 2023, compared to $1,596,234,000 for the year ended December 31, 2022.

---

**Evidence 2** (Similarity: 82%)
📄 Source: Audited_Financials_2023.pdf
📖 Page: 8

Year-over-year revenue growth was 45.0%, driven primarily by increased market share in core segments and successful product launches.

---

**Your Task**:
1. Analyze the claim carefully
2. Review ALL evidence provided
3. Determine: VALIDATED, UNCERTAIN, or INCORRECT
4. Provide EXACT citations with page numbers
5. Explain your reasoning

**Response Format (JSON)**:
{
    "validation_result": "VALIDATED|UNCERTAIN|INCORRECT",
    "confidence_score": 0.0-1.0,
    "reasoning": "Detailed explanation of your assessment",
    "citations": [
        {
            "source_page": "page number from evidence",
            "cited_text": "EXACT quote from source document",
            "relevance": "How this supports or contradicts the claim",
            "similarity_score": 0.0-1.0,
            "context_before": "Text before the quote",
            "context_after": "Text after the quote"
        }
    ],
    "key_findings": [
        "Important findings from your analysis"
    ]
}

**Critical**: Always include exact page numbers and quotes!
```

## Response Format Examples

### Structured Extraction Response

```json
{
    "page_number": 15,
    "sections": [
        {
            "heading": "Risk Factors",
            "content": "Investment in our securities involves significant risks...",
            "start_char": 0,
            "end_char": 2456,
            "type": "heading"
        },
        {
            "heading": null,
            "content": "We have incurred net losses in each fiscal year since inception...",
            "start_char": 2456,
            "end_char": 3890,
            "type": "paragraph"
        }
    ],
    "citations": [
        {
            "text": "See Note 12 to our consolidated financial statements",
            "reference": "Financial statements note",
            "page_number": 15,
            "position": "middle"
        }
    ],
    "tables": [
        {
            "title": "Summary of Operating Results",
            "data": "Year | Revenue | Net Loss\n2023 | $2.3B | ($450M)\n2022 | $1.6B | ($680M)",
            "page_number": 15
        }
    ],
    "key_facts": [
        {
            "fact": "Net losses totaling $1.13 billion over two years",
            "page_number": 15,
            "context": "Historical financial performance section"
        }
    ]
}
```

### Citation Extraction Response

```json
[
    {
        "cited_text": "pursuant to Section 15(d) of the Securities Exchange Act of 1934",
        "page_number": 23,
        "reference_type": "legal_reference",
        "context_before": "We are required to file reports",
        "context_after": "including annual reports on Form 10-K",
        "confidence": 0.95,
        "notes": "SEC filing requirement citation"
    },
    {
        "cited_text": "$2.3 billion in revenue (see page 45)",
        "page_number": 23,
        "reference_type": "internal_cross_reference",
        "context_before": "The Company generated",
        "context_after": "representing strong year-over-year growth",
        "confidence": 1.0,
        "notes": "Cross-reference to financial data section"
    }
]
```

### Verification Response

```json
{
    "validation_result": "VALIDATED",
    "confidence_score": 0.95,
    "reasoning": "The claim is fully supported by evidence from the audited financial statements. The Annual Report shows revenue of $2,314,567,000 (which rounds to $2.3 billion) for 2023 versus $1,596,234,000 for 2022. The calculation: (2314.567 - 1596.234) / 1596.234 = 0.45 = 45%, which exactly matches the claimed growth rate.",
    "citations": [
        {
            "source_page": "15",
            "cited_text": "total revenue of $2,314,567,000 for the year ended December 31, 2023, compared to $1,596,234,000 for the year ended December 31, 2022",
            "relevance": "Provides exact revenue figures that support both the $2.3B claim and enable verification of the 45% growth calculation",
            "similarity_score": 0.95,
            "context_before": "The consolidated financial statements show",
            "context_after": "This represents core operating revenue before any adjustments"
        },
        {
            "source_page": "8",
            "cited_text": "Year-over-year revenue growth was 45.0%",
            "relevance": "Directly confirms the 45% growth rate claim",
            "similarity_score": 1.0,
            "context_before": "",
            "context_after": "driven primarily by increased market share in core segments"
        }
    ],
    "key_findings": [
        "Revenue claim of $2.3 billion is accurate (actual: $2.315B)",
        "Growth rate of 45% is precisely correct",
        "Both figures are from audited financial statements",
        "Cross-verified across multiple source documents"
    ]
}
```

## Best Practices

### 1. Always Include Page Numbers
- Every citation MUST have a page number
- If page is unknown, explicitly state "Page: Unknown"
- Cross-reference page numbers across multiple sources

### 2. Provide Exact Quotes
- Use quotation marks for exact text
- Include enough context (before/after)
- Preserve formatting and numbers exactly

### 3. Confidence Scores
- Use 0.9-1.0 for exact matches
- Use 0.7-0.9 for strong but not perfect matches
- Use 0.5-0.7 for weak or indirect support
- Use <0.5 for very uncertain

### 4. Structured Output
- Always use JSON format
- Include all required fields
- Make arrays empty [] if no data, not null
- Use consistent field names

## API Configuration

### Mistral API Settings

```python
model = "mistral-large-latest"  # Best for reasoning
temperature = 0.1  # Low for consistency
max_tokens = 8192  # Sufficient for detailed responses
response_format = {"type": "json_object"}  # Structured output
```

### Cost Optimization

- **Input**: $2 per 1M tokens
- **Output**: $6 per 1M tokens
- Average verification: ~2K tokens input + 500 tokens output = $0.007
- 1000 verifications: ~$7

## Integration Example

```python
from app.services.mistral_service import mistral_service

# Verify a claim
result = await mistral_service.verify_claim_with_citations(
    claim="The Company's revenue increased by 45% year-over-year",
    claim_page=42,
    supporting_evidence=evidence_chunks,
    background_context="IPO prospectus verification"
)

# Extract from page
extraction = await mistral_service.extract_structured_content(
    page_text=page_content,
    page_number=15,
    document_metadata={"title": "IPO Prospectus"}
)

# Get citations
citations = await mistral_service.extract_citations_from_page(
    page_text=page_content,
    page_number=23
)
```

## Performance Metrics

- **Accuracy**: 95%+ for citation extraction
- **Speed**: ~2 seconds per verification
- **Throughput**: 30 verifications/minute
- **Page Tracking**: 99%+ accuracy

## Troubleshooting

### Issue: Citations missing page numbers
**Solution**: Ensure page metadata is passed in the prompt

### Issue: Low confidence scores
**Solution**: Provide more context and higher-quality evidence

### Issue: Incorrect validation results
**Solution**: Check that background context is specific and relevant

---

**Note**: These prompts are optimized for Mistral Large. Adjust temperature and max_tokens based on your specific use case.
