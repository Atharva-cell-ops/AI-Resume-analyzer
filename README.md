# AI Resume Analyzer

A simple interactive resume analysis tool built with Python and Streamlit.

## Features

- Paste resume text or upload a `.txt` / `.pdf` resume
- Analyze structure, skills, action verbs, readability, and experience
- Get a resume score and improvement suggestions
- Optionally compare resume keywords against a target job description

## Setup

1. Create a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Run

```bash
streamlit run app.py
```

Then open the local Streamlit URL shown in the terminal.

## Project files

- `app.py` — Streamlit front-end and user interface
- `resume_analyzer.py` — resume parsing, scoring, and suggestion logic
- `requirements.txt` — Python dependencies

## Notes

- The analyzer uses keyword and section heuristics to evaluate resumes.
- For best results, paste plain resume text or upload a text-based PDF.
- Customize `SKILL_KEYWORDS` and `ACTION_VERBS` in `resume_analyzer.py` to tailor analysis to your industry.
