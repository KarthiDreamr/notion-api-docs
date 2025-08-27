---
title: AI guides — tools and prompts
sidebar_position: 98
slug: /ai-guides/tools-and-prompts
---

# AI Guides - Tools Used and Prompts

This section documents the AI-powered development approach used to create this Notion API documentation and sample applications, providing insights for developers looking to leverage similar AI-assisted workflows.

## AI Tools Utilized

### Perplexity Spaces with Advanced Models

**Primary Tool**: Perplexity Spaces featuring GPT-5 thinking and Claude-4 Sonnet thinking capabilities

**Use Cases**:
- **Research and Analysis**: Deep-dive research into API specifications, best practices, and industry standards
- **Multi-step Problem Solving**: Breaking down complex documentation requirements into manageable components  
- **Cross-referencing**: Validating information across multiple sources and ensuring technical accuracy
- **Content Planning**: Structuring comprehensive documentation roadmaps and information architecture

**Why This Combination**:
- GPT-5 thinking for complex reasoning and problem decomposition
- Claude-4 Sonnet for nuanced writing, clear explanations, and developer-friendly tone
- Real-time web access for up-to-date information and verification

### Cursor IDE

**Integration Type**: AI-powered code editor with contextual assistance

**Applications**:
- **Live Code Generation**: Real-time code snippet creation and validation
- **Code Refactoring**: Iterative improvements to examples and implementations
- **Syntax Validation**: Ensuring code examples work across different environments
- **Rapid Prototyping**: Quick testing of concepts before documentation inclusion

## Prompt Engineering Strategies

### 1. Modular Content Generation

**Approach**: Breaking large documentation tasks into specific, focused prompts

**Example Prompt Structure**:
```
"Generate section X covering Y and Z, following these requirements:
1. Include practical code examples in JavaScript and Python  
2. Focus on copy-pasteable patterns
3. Address common error scenarios
4. Maintain consistency with previous sections"
```

**Benefits**: 
- Consistent quality across sections
- Easier review and revision process
- Better handling of complex technical topics

### 2. Role-Based Prompting

**Strategy**: Using explicit role assignments to get targeted responses

**Key Roles Used**:
- **Technical Writer**: "Act as an experienced DevRel technical writer..."
- **Code Reviewer**: "Review this code as a senior developer would..."
- **End User**: "Evaluate this from a new developer's perspective..."

### 3. Iterative Refinement Prompts

**Process**: Multi-turn conversations for progressive improvement

**Pattern**:
1. Initial content generation
2. Feedback incorporation: "Improve this by adding X and removing Y"
3. Consistency checks: "Ensure this aligns with the established patterns"
4. Final polish: "Review for clarity and completeness"

### 4. Context Maintenance

**Technique**: Providing consistent context across conversation threads

**Context Elements**:
- Project scope and requirements
- Target audience (developers integrating with Notion API)
- Style guidelines and tone preferences
- Technical constraints and deployment targets

## Custom Instructions

### Content Style Guidelines

**Tone**: Professional but approachable, avoiding overly technical jargon
**Structure**: Always include practical examples, error handling, and next steps
**Code Quality**: Production-ready examples with proper error handling
**Comprehensiveness**: Cover both happy path and edge cases

### Technical Requirements

**Languages**: Prioritize JavaScript (Vite) and Python (Flask) for examples
**Deployment**: Include configuration for modern cloud platforms
**Security**: Always include authentication and error handling patterns
**Maintenance**: Write code that's easy to understand and modify

## Specific Prompt Examples

### Documentation Generation
```
"Create comprehensive documentation for [API endpoint] that includes:
- Clear explanation of purpose and use cases
- curl, JavaScript (Vite), and Python (Flask) examples
- Common error scenarios and solutions
- Practical integration patterns
- Links to related documentation sections"
```

### Code Sample Creation
```
"Generate a production-ready [language] example that demonstrates:
- Proper authentication handling
- Error handling with retries
- Environment variable usage
- Clear comments explaining each step
- Easy copy-paste integration"
```

### Content Review and Improvement
```
"Review this documentation section for:
- Technical accuracy and completeness
- Clarity for developers new to the API
- Consistency with established patterns
- Missing edge cases or error scenarios
- Opportunities for better examples"
```

## Workflow Integration

### Development Process

1. **Planning Phase**: Use AI for research and content architecture
2. **Content Creation**: Generate initial drafts with specific prompts
3. **Code Validation**: Test examples in Cursor IDE with AI assistance
4. **Review Cycles**: Iterative improvement through targeted prompts
5. **Final Polish**: Consistency checks and user experience validation

### Quality Assurance

- **Cross-Model Validation**: Compare outputs between GPT-5 and Claude-4
- **Code Testing**: Validate all examples in real environments
- **User Perspective**: Regular "fresh eyes" reviews from AI assistant
- **Consistency Audits**: Ensure patterns are maintained across sections

## Benefits and Outcomes

### Development Speed
- **10x faster content creation** compared to manual documentation writing
- **Reduced context switching** between research, writing, and coding
- **Parallel workstreams** for documentation and sample applications

### Quality Improvements
- **Comprehensive coverage** of edge cases and error scenarios
- **Consistent patterns** across all documentation sections
- **Production-ready examples** that work out of the box
- **Multiple perspective validation** through different AI models

### Developer Experience
- **Copy-pasteable code** that requires minimal modification
- **Clear explanations** that reduce learning curve
- **Practical examples** that mirror real-world use cases
- **Progressive complexity** from basic to advanced implementations

## Lessons Learned

### What Worked Well
- **Specific, detailed prompts** produced better results than generic requests
- **Role-based prompting** helped generate content for different audiences
- **Iterative refinement** improved quality significantly over single-pass generation
- **Cross-model validation** caught errors and improved comprehensiveness

### Areas for Improvement
- **Code testing integration** - AI-generated code still requires manual validation
- **Context window management** - Long conversations sometimes lose important details
- **Consistency maintenance** - Requires explicit prompts to maintain patterns across sections

## Recommendations for Similar Projects

### Getting Started
1. **Define clear content requirements** before beginning
2. **Establish style guidelines** and share them consistently
3. **Use role-based prompts** for different types of content
4. **Plan for iterative improvement** rather than expecting perfect first drafts

### Advanced Techniques
1. **Cross-model validation** for complex technical topics
2. **Context documentation** to maintain consistency across sessions
3. **Template development** for recurring content patterns
4. **Integration testing** to validate AI-generated examples

### Tool Selection
- **Perplexity Spaces**: Excellent for research and multi-step reasoning
- **Cursor IDE**: Essential for code validation and live testing
- **Custom instructions**: Critical for maintaining consistent quality
- **Multiple models**: Valuable for cross-validation and different strengths

This AI-assisted approach enabled the creation of comprehensive, production-ready documentation and sample applications in a fraction of the time required for manual development, while maintaining high quality and consistency throughout the project.