import re
from collections import Counter
from dataclasses import dataclass
from typing import Dict, List, Optional

SKILL_KEYWORDS = [
    "python", "java", "sql", "aws", "azure", "gcp", "machine learning", "data analysis",
    "deep learning", "tensorflow", "pytorch", "excel", "power bi", "tableau", "javascript",
    "react", "node", "django", "flask", "nlp", "pandas", "numpy", "matplotlib",
    "statistics", "project management", "leadership", "communication", "automation", "devops",
    "kubernetes", "docker", "git", "jira", "agile", "scrum", "crm", "salesforce", "html",
    "css", "rest api", "api", "cloud", "cybersecurity", "seo", "content strategy", "analytics"
]

ACTION_VERBS = [
    "improved", "managed", "developed", "led", "designed", "implemented", "optimized", "automated",
    "launched", "created", "reduced", "increased", "built", "analyzed", "coordinated", "negotiated",
    "streamlined", "mentored", "delivered", "executed", "maintained", "enhanced", "trained", "supported"
]

SECTION_HEADERS = [
    "summary", "objective", "experience", "work experience", "professional experience", "employment",
    "education", "skills", "technical skills", "certifications", "projects", "achievements", "awards",
    "publications", "volunteer", "interests", "contact"
]

@dataclass
class ResumeAnalysis:
    score: float
    strengths: List[str]
    suggestions: List[str]
    statistics: Dict[str, float]
    sections: Dict[str, str]
    top_skills: List[str]
    top_action_verbs: List[str]
    keyword_matches: List[str]
    experience_years: Optional[float]


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def extract_sections(text: str) -> Dict[str, str]:
    text = normalize_text(text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    sections: Dict[str, str] = {}
    current_section = "summary"
    buffer: List[str] = []

    header_pattern = re.compile(r"^(%s)[:\-]*$" % "|".join(re.escape(h) for h in SECTION_HEADERS), re.IGNORECASE)

    for line in lines:
        header_match = header_pattern.match(line.lower())
        if header_match:
            sections[current_section] = " ".join(buffer).strip()
            current_section = header_match.group(1).lower()
            buffer = []
        else:
            buffer.append(line)

    sections[current_section] = " ".join(buffer).strip()
    return sections


def count_sentences(text: str) -> int:
    return max(1, len(re.findall(r"[.!?]+", text)))


def count_syllables(word: str) -> int:
    word = word.lower()
    word = re.sub(r"[^a-z]", "", word)
    if not word:
        return 0
    vowels = "aeiouy"
    syllables = 0
    prev_was_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_was_vowel:
            syllables += 1
        prev_was_vowel = is_vowel
    if word.endswith("e") and len(word) > 2 and not word.endswith("le"):
        syllables -= 1
    if syllables == 0:
        syllables = 1
    return syllables


def count_words(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text))


def estimate_readability(text: str) -> float:
    words = count_words(text)
    sentences = count_sentences(text)
    syllables = sum(count_syllables(word) for word in re.findall(r"\b\w+\b", text))
    if words == 0 or sentences == 0:
        return 0.0
    return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)


def detect_experience_years(text: str) -> Optional[float]:
    ranges = re.findall(r"(\d{4})\s*[–-]\s*(\d{4}|Present|present)", text)
    if ranges:
        total = 0.0
        for start, end in ranges:
            try:
                start_year = int(start)
                end_year = int(end) if end.isdigit() else 2026
                total += max(0, end_year - start_year)
            except ValueError:
                continue
        return round(total, 1)
    match = re.search(r"(\d+(?:\.\d+)?)\s+years?", text, re.IGNORECASE)
    return float(match.group(1)) if match else None


def find_keywords(text: str, candidates: List[str]) -> List[str]:
    lower = text.lower()
    found = []
    for keyword in candidates:
        if re.search(r"\b" + re.escape(keyword.lower()) + r"\b", lower):
            found.append(keyword)
    return sorted(set(found), key=lambda k: candidates.index(k))


def analyze_resume(text: str, job_description: Optional[str] = None) -> ResumeAnalysis:
    text = normalize_text(text)
    sections = extract_sections(text)
    skills = find_keywords(text, SKILL_KEYWORDS)
    verbs = find_keywords(text, ACTION_VERBS)
    snippet = text[:800]
    readability = estimate_readability(snippet)
    experience_years = detect_experience_years(text)
    word_count = count_words(text)
    achievement_count = len(re.findall(r"\b(achieved|delivered|reduced|improved|increased|optimized|saved|generated|implemented)\b", text, re.IGNORECASE))
    section_count = len([s for s in sections.values() if s])
    job_matches: List[str] = []
    keyword_matches: List[str] = []

    if job_description:
        job_keywords = find_keywords(job_description, SKILL_KEYWORDS)
        keyword_matches = [kw for kw in skills if kw in job_keywords]
        job_matches = keyword_matches

    score_components = [
        min(30, section_count * 6),
        min(25, len(skills) * 4),
        min(20, achievement_count * 4),
        min(15, max(0, min(100, readability))),
        min(10, (experience_years or 0) * 1.5)
    ]
    score = round(sum(score_components) / 1.0, 1)

    strengths = []
    suggestions = []

    if skills:
        strengths.append(f"Strong skill set detected: {', '.join(skills[:6])}.")
    else:
        suggestions.append("Add clear technical and professional skills relevant to your target role.")

    if verbs:
        strengths.append(f"Good use of action verbs such as {', '.join(verbs[:5])}.")
    else:
        suggestions.append("Use stronger action verbs to describe impact and responsibilities.")

    if experience_years:
        strengths.append(f"Estimated {experience_years} years of professional experience mentioned.")
    else:
        suggestions.append("Include a clear experience summary with dates or total years worked.")

    if readability >= 60:
        strengths.append("Resume text is easy to read and concise.")
    else:
        suggestions.append("Shorten long sentences and remove repetition to improve readability.")

    if word_count < 250:
        suggestions.append("Add more details on measurable achievements to improve resume depth.")
    elif word_count > 700:
        suggestions.append("Consider trimming less relevant content to keep the resume focused.")

    if achievement_count == 0:
        suggestions.append("Use metrics and achievement statements to show impact.")
    else:
        strengths.append(f"Found {achievement_count} achievement-oriented phrases.")

    if not sections.get("education"):
        suggestions.append("Add an Education section with degrees, institutions, and dates.")
    if not sections.get("experience") and not sections.get("work experience"):
        suggestions.append("Add a dedicated Work Experience section describing your recent roles.")
    if not sections.get("skills") and not sections.get("technical skills"):
        suggestions.append("Add a Skills section with tools, technologies, and key strengths.")

    if job_description and keyword_matches:
        strengths.append(f"Matches job keywords: {', '.join(keyword_matches)}.")
    elif job_description and not keyword_matches:
        suggestions.append("Tailor your resume by matching skills and keywords from the job description.")

    keyword_matches = keyword_matches or skills[:6]

    statistics = {
        "Resume score": score,
        "Word count": word_count,
        "Readability": round(readability, 1),
        "Experience years": experience_years or 0.0,
        "Skills found": len(skills),
        "Achievement phrases": achievement_count,
        "Sections detected": section_count,
    }

    return ResumeAnalysis(
        score=score,
        strengths=strengths,
        suggestions=suggestions,
        statistics=statistics,
        sections={k: v for k, v in sections.items() if v},
        top_skills=skills[:10],
        top_action_verbs=verbs[:10],
        keyword_matches=keyword_matches,
        experience_years=experience_years,
    )
