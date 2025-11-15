"""Mistral AI service for document extraction and citation tracking.

Mistral AI provides superior document understanding and reasoning capabilities,
making it ideal for extracting structured information and citations from PDFs.
"""

from typing import List, Dict, Optional, Any
from loguru import logger
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from tenacity import retry, stop_after_attempt, wait_exponential
import json
import re

from app.core.config import settings


class MistralService:
    """Service for PDF extraction and citation using Mistral AI."""

    def __init__(self):
        """Initialize Mistral client."""
        self.client = MistralClient(api_key=settings.MISTRAL_API_KEY)
        self.model = settings.MISTRAL_MODEL
        self.temperature = settings.MISTRAL_TEMPERATURE
        self.max_tokens = settings.MISTRAL_MAX_TOKENS

    # PROMPT TEMPLATES FOR DOCUMENT EXTRACTION

    EXTRACTION_SYSTEM_PROMPT = """You are an expert document analyst specializing in extracting structured information from financial and legal documents, particularly IPO prospectuses.

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

Be meticulous about accuracy - this will be used for legal verification."""

    CITATION_EXTRACTION_PROMPT = """You are a citation extraction specialist for legal and financial documents.

Given a document page, extract ALL citations, references, and supporting evidence with EXACT page numbers and positions.

For each citation, provide:
1. **Exact text**: The precise quote being cited
2. **Page number**: Where it appears (critical!)
3. **Context**: Surrounding sentences for clarity
4. **Type**: Reference type (financial data, legal clause, external source, etc.)
5. **Confidence**: How certain you are about this citation

Return structured JSON format."""

    VERIFICATION_SYSTEM_PROMPT = """You are an expert IPO document verifier with deep knowledge of financial regulations and disclosure requirements.

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

ALWAYS cite exact page numbers and quote the supporting text."""

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def extract_structured_content(
        self,
        page_text: str,
        page_number: int,
        document_metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Extract structured content from a PDF page using Mistral.

        Args:
            page_text: Text content from the page
            page_number: Page number
            document_metadata: Optional metadata about the document

        Returns:
            Structured extraction with citations and metadata
        """
        try:
            user_prompt = f"""Extract structured information from this IPO document page.

**Page Number**: {page_number}
**Document Context**: {document_metadata.get('title', 'IPO Document') if document_metadata else 'IPO Document'}

**Page Content**:
```
{page_text}
```

Extract and return JSON with:
{{
    "page_number": {page_number},
    "sections": [
        {{
            "heading": "Section title",
            "content": "Section text",
            "start_char": 0,
            "end_char": 100,
            "type": "paragraph|heading|table|list"
        }}
    ],
    "citations": [
        {{
            "text": "Exact citation text",
            "reference": "What it references",
            "page_number": {page_number},
            "position": "approximate position in text"
        }}
    ],
    "tables": [
        {{
            "title": "Table title",
            "data": "Structured table data",
            "page_number": {page_number}
        }}
    ],
    "key_facts": [
        {{
            "fact": "Important fact or figure",
            "page_number": {page_number},
            "context": "Surrounding context"
        }}
    ]
}}"""

            messages = [
                ChatMessage(role="system", content=self.EXTRACTION_SYSTEM_PROMPT),
                ChatMessage(role="user", content=user_prompt)
            ]

            response = self.client.chat(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            logger.info(f"Extracted structured content from page {page_number}")
            return result

        except Exception as e:
            logger.error(f"Error in structured extraction: {e}")
            return {
                "page_number": page_number,
                "sections": [{"content": page_text, "type": "paragraph"}],
                "citations": [],
                "tables": [],
                "key_facts": []
            }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def extract_citations_from_page(
        self,
        page_text: str,
        page_number: int
    ) -> List[Dict[str, Any]]:
        """
        Extract all citations from a page with precise tracking.

        Args:
            page_text: Text from the page
            page_number: Page number

        Returns:
            List of citations with exact positions
        """
        try:
            user_prompt = f"""Extract ALL citations and references from this page with EXACT details.

**Page Number**: {page_number}

**Content**:
```
{page_text}
```

Return JSON array of citations:
[
    {{
        "cited_text": "Exact text being cited or referenced",
        "page_number": {page_number},
        "reference_type": "financial_data|legal_reference|external_source|internal_cross_reference",
        "context_before": "Text before citation",
        "context_after": "Text after citation",
        "confidence": 0.0-1.0,
        "notes": "Any relevant notes about this citation"
    }}
]

If no citations found, return empty array."""

            messages = [
                ChatMessage(role="system", content=self.CITATION_EXTRACTION_PROMPT),
                ChatMessage(role="user", content=user_prompt)
            ]

            response = self.client.chat(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            citations = result.get("citations", [])

            logger.info(f"Extracted {len(citations)} citations from page {page_number}")
            return citations

        except Exception as e:
            logger.error(f"Error extracting citations: {e}")
            return []

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def verify_claim_with_citations(
        self,
        claim: str,
        claim_page: Optional[int],
        supporting_evidence: List[Dict[str, Any]],
        background_context: str = ""
    ) -> Dict[str, Any]:
        """
        Verify a claim against supporting evidence with precise citation tracking.

        Args:
            claim: The claim to verify
            claim_page: Page number where claim appears
            supporting_evidence: List of evidence chunks with page numbers
            background_context: Additional context about the document

        Returns:
            Verification result with precise citations
        """
        try:
            # Format evidence with page numbers
            evidence_text = self._format_evidence_with_pages(supporting_evidence)

            user_prompt = f"""Verify this claim from an IPO document with PRECISION.

**Claim** (Page {claim_page if claim_page else 'Unknown'}):
"{claim}"

**Background Context**:
{background_context if background_context else 'IPO document verification'}

**Supporting Evidence from Source Documents**:
{evidence_text}

**Your Task**:
1. Analyze the claim carefully
2. Review ALL evidence provided
3. Determine: VALIDATED, UNCERTAIN, or INCORRECT
4. Provide EXACT citations with page numbers
5. Explain your reasoning

**Response Format (JSON)**:
{{
    "validation_result": "VALIDATED|UNCERTAIN|INCORRECT",
    "confidence_score": 0.0-1.0,
    "reasoning": "Detailed explanation of your assessment",
    "citations": [
        {{
            "source_page": "page number from evidence",
            "cited_text": "EXACT quote from source document",
            "relevance": "How this supports or contradicts the claim",
            "similarity_score": 0.0-1.0,
            "context_before": "Text before the quote",
            "context_after": "Text after the quote"
        }}
    ],
    "key_findings": [
        "Important findings from your analysis"
    ]
}}

**Critical**: Always include exact page numbers and quotes!"""

            messages = [
                ChatMessage(role="system", content=self.VERIFICATION_SYSTEM_PROMPT),
                ChatMessage(role="user", content=user_prompt)
            ]

            response = self.client.chat(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)

            # Ensure citations have all required fields
            citations = result.get("citations", [])
            for citation in citations:
                citation["page_number"] = citation.get("source_page", "Unknown")
                if "similarity_score" not in citation:
                    citation["similarity_score"] = 0.85  # Default high confidence

            logger.info(
                f"Verified claim with result: {result.get('validation_result')} "
                f"({len(citations)} citations)"
            )

            return result

        except Exception as e:
            logger.error(f"Error in claim verification: {e}")
            return {
                "validation_result": "UNCERTAIN",
                "confidence_score": 0.0,
                "reasoning": f"Error during verification: {str(e)}",
                "citations": [],
                "key_findings": []
            }

    def _format_evidence_with_pages(self, evidence: List[Dict[str, Any]]) -> str:
        """Format evidence chunks with page numbers for the prompt."""
        formatted = []

        for idx, chunk in enumerate(evidence, 1):
            page_num = chunk.get("page_number", "Unknown")
            filename = chunk.get("filename", "Document")
            content = chunk.get("content", "")
            similarity = chunk.get("similarity", 0.0)

            formatted.append(
                f"""**Evidence {idx}** (Similarity: {similarity:.2%})
📄 Source: {filename}
📖 Page: {page_num}

{content}

---"""
            )

        return "\n\n".join(formatted)

    async def analyze_document_structure(
        self,
        full_text: str,
        pages: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze overall document structure to identify sections and organization.

        Args:
            full_text: Complete document text
            pages: List of page information

        Returns:
            Document structure analysis
        """
        try:
            user_prompt = f"""Analyze the structure of this IPO document.

**Total Pages**: {len(pages)}

**Document Preview** (first 2000 characters):
{full_text[:2000]}

Identify and return JSON:
{{
    "document_type": "IPO Prospectus|Annual Report|Financial Statement|etc",
    "main_sections": [
        {{
            "title": "Section name",
            "start_page": 1,
            "end_page": 5,
            "description": "What this section covers"
        }}
    ],
    "key_pages": [
        {{
            "page": 1,
            "importance": "cover|financial_data|risk_factors|etc",
            "reason": "Why this page is important"
        }}
    ],
    "metadata": {{
        "company_name": "Extracted if found",
        "filing_date": "Extracted if found",
        "document_date": "Extracted if found"
    }}
}}"""

            messages = [
                ChatMessage(role="system", content=self.EXTRACTION_SYSTEM_PROMPT),
                ChatMessage(role="user", content=user_prompt)
            ]

            response = self.client.chat(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=4096,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            logger.info("Analyzed document structure")
            return result

        except Exception as e:
            logger.error(f"Error analyzing document structure: {e}")
            return {
                "document_type": "Unknown",
                "main_sections": [],
                "key_pages": [],
                "metadata": {}
            }


# Singleton instance
mistral_service = MistralService()
