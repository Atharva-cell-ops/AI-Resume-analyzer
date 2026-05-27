from typing import Optional

import streamlit as st
from PyPDF2 import PdfReader
from resume_analyzer import analyze_resume


def load_uploaded_resume(uploaded_file) -> str:
    if uploaded_file is None:
        return ""
    if uploaded_file.type == "text/plain":
        return uploaded_file.getvalue().decode("utf-8", errors="ignore")
    if uploaded_file.type == "application/pdf":
        reader = PdfReader(uploaded_file)
        text = []
        for page in reader.pages:
            text.append(page.extract_text() or "")
        return "\n".join(text)
    return uploaded_file.getvalue().decode("utf-8", errors="ignore")


def main():
    st.set_page_config(page_title="AI Resume Analyzer", page_icon="📝", layout="wide")
    st.title("AI Resume Analyzer")
    st.markdown(
        "Use the analyzer below to evaluate your resume text, highlight strengths, and get practical improvement suggestions."
    )

    with st.expander("How to use"):
        st.markdown(
            "1. Paste your resume text or upload a `.txt` / `.pdf` file.\n"
            "2. Optionally paste a job description to compare keyword alignment.\n"
            "3. Click Analyze and review the score, strengths, and suggestions."
        )

    uploaded_file = st.file_uploader("Upload resume file", type=["txt", "pdf"])
    if uploaded_file is not None:
        resume_text = load_uploaded_resume(uploaded_file)
        resume_text = st.text_area("Resume text loaded", value=resume_text, height=320)
    else:
        resume_text = st.session_state.get("resume_text", "")
        resume_text = st.text_area("Paste resume text here", value=resume_text, height=320)

    job_description = st.text_area("Optional job description / target role", height=180)
    analyze = st.button("Analyze Resume")

    if analyze and resume_text:
        result = analyze_resume(resume_text, job_description if job_description else None)

        col1, col2 = st.columns([2, 1])
        with col1:
            st.subheader("Resume Score")
            st.metric("AI Score", f"{result.score}/100")
            st.write("### Strengths")
            for strength in result.strengths:
                st.success(strength)
            if result.suggestions:
                st.write("### Suggestions")
                for suggestion in result.suggestions:
                    st.warning(suggestion)

        with col2:
            st.write("### Quick statistics")
            for label, value in result.statistics.items():
                st.write(f"**{label}:** {value}")
            if result.top_skills:
                st.write("**Top skills detected:**")
                st.write(", ".join(result.top_skills))
            if result.top_action_verbs:
                st.write("**Action verbs found:**")
                st.write(", ".join(result.top_action_verbs))
            if result.keyword_matches and job_description:
                st.write("**Job keyword matches:**")
                st.write(", ".join(result.keyword_matches))

        st.write("---")
        st.write("### Detected Sections")
        for section_name, section_text in result.sections.items():
            st.write(f"**{section_name.title()}**")
            st.write(section_text[:500] + ("..." if len(section_text) > 500 else ""))

        st.write("---")
        st.write("### Resume Cleanup Tips")
        st.markdown(
            "- Highlight measurable achievements with numbers and outcomes.\n"
            "- Use a clean layout and consistent section titles.\n"
            "- Tailor your skills and keywords to the job description.\n"
            "- Keep the resume concise, ideally 1 page for early-career professionals and 1-2 pages for experienced candidates."
        )

    st.sidebar.header("Need an example?")
    st.sidebar.info(
        "Try pasting a resume summary plus experience bullets. The analyzer will score clarity, skills, achievements, and structure."
    )

    if st.sidebar.button("Load sample resume"):
        sample = (
            "Data Science Leader with 8+ years of experience delivering analytics solutions for global teams. "
            "Skilled in Python, SQL, machine learning, and data visualization.\n\n"
            "Experience:\n"
            "- Led a cross-functional analytics team to build a customer churn model that improved retention by 12%.\n"
            "- Developed automated ETL pipelines using Python and AWS, reducing data delivery time by 40%.\n\n"
            "Education:\n"
            "Bachelor of Science in Computer Science, University of Example, 2016.\n\n"
            "Skills:\n"
            "Python, SQL, AWS, Tableau, machine learning, statistics, Agile."
        )
        st.session_state.resume_text = sample
        st.experimental_rerun()


if __name__ == "__main__":
    main()
