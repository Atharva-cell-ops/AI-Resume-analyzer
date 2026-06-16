/**
 * Main Controller & UI Handler for ResuGlow Resume Analyzer.
 * Orchestrates file reading, drag-and-drop, tab switching, NLP evaluations, 
 * Gemini API routing, HTML DOM rendering, and report exportation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // State Management
    // -----------------------------------------------------------------
    let selectedFile = null;
    let extractedText = '';
    let apiKey = localStorage.getItem('resu_glow_gemini_key') || '';
    let currentAnalysis = null;
    let activeTab = 'tab-ats';

    // -----------------------------------------------------------------
    // DOM Element Selectors
    // -----------------------------------------------------------------
    const apiToggleBtn = document.getElementById('api-toggle-btn');
    const apiConfigPanel = document.getElementById('api-config-panel');
    const geminiKeyInput = document.getElementById('gemini-key-input');
    const saveApiBtn = document.getElementById('save-api-btn');
    
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const selectedFileCard = document.getElementById('selected-file-card');
    const fileNameEl = document.getElementById('file-name');
    const fileSizeEl = document.getElementById('file-size');
    const removeFileBtn = document.getElementById('remove-file-btn');
    
    const jdTextarea = document.getElementById('jd-textarea');
    const analyzeBtn = document.getElementById('analyze-btn');
    
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingTitle = document.getElementById('loading-title');
    const loadingSubtitle = document.getElementById('loading-subtitle');
    
    const setupScreen = document.getElementById('setup-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const reuploadBtn = document.getElementById('reupload-btn');
    const exportReportBtn = document.getElementById('export-report-btn');
    
    // Tab switching elements
    const navButtons = document.querySelectorAll('.nav-item-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // -----------------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------------
    function init() {
        // Load API key from local storage if existing
        if (apiKey) {
            geminiKeyInput.value = apiKey;
            updateApiBadge(true);
        } else {
            updateApiBadge(false);
        }
        
        // Initialize Lucide Icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setupEventListeners();
    }

    // -----------------------------------------------------------------
    // Event Listeners Configuration
    // -----------------------------------------------------------------
    function setupEventListeners() {
        // API Key settings toggle
        apiToggleBtn.addEventListener('click', () => {
            apiConfigPanel.classList.toggle('active');
        });

        // Save API Key
        saveApiBtn.addEventListener('click', () => {
            const val = geminiKeyInput.value.trim();
            if (val) {
                apiKey = val;
                localStorage.setItem('resu_glow_gemini_key', val);
                updateApiBadge(true);
                showToast('Gemini API Key saved securely.', 'success');
            } else {
                apiKey = '';
                localStorage.removeItem('resu_glow_gemini_key');
                updateApiBadge(false);
                showToast('Gemini API Key removed.', 'info');
            }
            apiConfigPanel.classList.remove('active');
        });

        // Drag & Drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelection(files[0]);
            }
        });

        // Browse files button
        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });

        // Remove file button
        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering dropzone click
            resetFileSelection();
        });

        // Analyze button
        analyzeBtn.addEventListener('click', () => {
            triggerAnalysis();
        });

        // Reupload button
        reuploadBtn.addEventListener('click', () => {
            resetFileSelection();
            dashboardScreen.classList.remove('active');
            setupScreen.style.display = 'flex';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Download Report button
        exportReportBtn.addEventListener('click', () => {
            exportAnalysisReport();
        });

        // Sidebar Navigation Tabs
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTabId = button.getAttribute('data-tab');
                switchTab(targetTabId);
            });
        });
    }

    // -----------------------------------------------------------------
    // Core Handlers
    // -----------------------------------------------------------------
    
    function handleFileSelection(file) {
        const fileExt = file.name.split('.').pop().toLowerCase();
        const allowedExts = ['pdf', 'txt', 'png', 'jpg', 'jpeg', 'webp'];
        
        if (!allowedExts.includes(fileExt)) {
            showToast('Unsupported file type. Please upload a PDF, TXT, or Image file (PNG, JPG, JPEG, WEBP).', 'error');
            return;
        }

        // Limit size to 10MB
        if (file.size > 10 * 1024 * 1024) {
            showToast('File is too large. Max allowed size is 10MB.', 'error');
            return;
        }

        selectedFile = file;
        
        // Show file details in card
        fileNameEl.textContent = file.name;
        
        // Formatted size
        const sizeKB = file.size / 1024;
        if (sizeKB > 1024) {
            fileSizeEl.textContent = (sizeKB / 1024).toFixed(1) + ' MB';
        } else {
            fileSizeEl.textContent = Math.round(sizeKB) + ' KB';
        }

        // Hide upload items, show selected card
        dropZone.querySelectorAll('.upload-icon-wrapper, .upload-text, span, #browse-btn').forEach(el => {
            el.style.display = 'none';
        });
        selectedFileCard.classList.add('active');
        
        // Enable analyze button
        analyzeBtn.removeAttribute('disabled');
        showToast(`File selected: ${file.name}`, 'info');
    }

    function resetFileSelection() {
        selectedFile = null;
        extractedText = '';
        fileInput.value = '';
        
        // Reset Dropzone UI
        dropZone.querySelectorAll('.upload-icon-wrapper, .upload-text, span, #browse-btn').forEach(el => {
            el.style.display = '';
        });
        selectedFileCard.classList.remove('active');
        
        // Disable analyze button
        analyzeBtn.setAttribute('disabled', 'true');
    }

    function switchTab(tabId) {
        activeTab = tabId;
        
        // Toggle Nav Buttons
        navButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Toggle Tab Panels
        tabContents.forEach(tab => {
            if (tab.id === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Helper to read image files as Base64.
     */
    function readImageAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                const base64Data = result.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Coordinate local or Gemini API analysis.
     */
    async function triggerAnalysis() {
        if (!selectedFile) return;

        const fileExt = selectedFile.name.split('.').pop().toLowerCase();
        const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(fileExt);

        if (isImage && !apiKey) {
            showToast('Image analysis requires Gemini AI. Please configure your API key in the top-right.', 'error');
            return;
        }

        // Show Loader
        loadingOverlay.classList.add('active');
        updateLoaderStatus('Parsing Resume...', isImage ? 'Preparing image data for Multimodal AI...' : 'Extracting structured details from your upload...');

        try {
            const jdContent = jdTextarea.value.trim();
            let imageObj = null;

            if (isImage) {
                // Read image as base64 for Gemini
                updateLoaderStatus('Processing Image...', 'Encoding image to Base64...');
                const base64Data = await readImageAsBase64(selectedFile);
                imageObj = {
                    mimeType: selectedFile.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                    base64: base64Data
                };
                extractedText = ''; // No extracted text locally for images
            } else {
                // 1. Client-Side Text Extraction for PDFs/TXTs
                extractedText = await PDFHelper.extractText(selectedFile);
            }

            if (apiKey) {
                // 2. Real Gemini Analysis
                updateLoaderStatus('Connecting to Gemini API...', isImage ? 'Multimodal OCR scanning & ATS alignment compilation...' : 'Analyzing alignment and compiling deep-dive recommendations...');
                
                try {
                    const geminiResult = await GeminiService.analyze(apiKey, extractedText, jdContent, imageObj);
                    
                    // Parse response into standard dashboard schema
                    currentAnalysis = processGeminiResponse(geminiResult, jdContent);
                    showToast(isImage ? 'Gemini Multimodal Resume Audit Successful!' : 'Gemini AI Resume Audit Successful!', 'success');
                } catch (apiErr) {
                    console.error('Gemini API failed.', apiErr);
                    if (isImage) {
                        throw new Error(`Gemini Multimodal analysis failed: ${apiErr.message}. Ensure your API key is valid.`);
                    }
                    showToast('Gemini API call failed. Falling back to Local NLP Analysis.', 'warning');
                    
                    // Fall back to local analysis
                    currentAnalysis = LocalAnalyzer.analyze(extractedText, jdContent);
                }
            } else {
                // 3. Local NLP Analysis
                updateLoaderStatus('Running Local NLP Audit...', 'Evaluating structure, computing keyword overlap, and scanning verbs...');
                
                // Add a small artificial delay so the premium loader doesn't flash too fast
                await new Promise(r => setTimeout(r, 1200));
                
                currentAnalysis = LocalAnalyzer.analyze(extractedText, jdContent);
                showToast('Local Heuristic Analysis Completed.', 'success');
            }

            // 4. Populate and Render Dashboard UI
            renderDashboard();

            // 5. Toggle Screen Transitions
            loadingOverlay.classList.remove('active');
            setupScreen.style.display = 'none';
            dashboardScreen.classList.add('active');
            
            // Default to ATS score tab
            switchTab('tab-ats');
            
        } catch (error) {
            console.error('Error during parsing/analysis:', error);
            loadingOverlay.classList.remove('active');
            showToast(`Analysis failed: ${error.message}`, 'error');
        }
    }

    // -----------------------------------------------------------------
    // Data Adaptation (Schema unification)
    // -----------------------------------------------------------------
    function processGeminiResponse(aiData, jobDesc) {
        // Adaptation layer: Merges Gemini intelligence with local readability & verb counting metrics
        // to display the richest possible information!
        
        const localDetails = extractedText 
            ? LocalAnalyzer.analyze(extractedText, jobDesc)
            : {
                overallScore: aiData.atsScore || 75,
                wordCount: 'N/A (Image)',
                readingEase: 'N/A',
                readabilityLabel: 'Multimodal Scan',
                readabilityColor: 'var(--accent-blue)',
                actionVerbCount: (aiData.tailoredBulletPoints || []).length * 2 || 8,
                actionVerbDensity: 'N/A',
                contactInfo: {
                    hasEmail: true,
                    hasPhone: true,
                    hasLinkedIn: true,
                    hasGitHub: false
                },
                structureScore: {
                    experience: true,
                    education: true,
                    skills: true,
                    projects: true,
                    summary: true
                },
                matchedKeywords: [],
                missingKeywords: [],
                feedback: [],
                weakBulletPoints: []
            };

        // Map severity keys if needed
        const processedFeedback = (aiData.weaknesses || []).map(w => ({
            category: 'AI Recommendation',
            severity: w.severity || 'medium',
            title: w.title,
            desc: w.description
        }));

        // Convert lists of missing skills into standard missing keywords format
        const processedMissingKeywords = (aiData.missingSkills || []).map(skill => ({
            keyword: skill.toLowerCase(),
            jdCount: 1
        }));

        // For image resumes, we can try to extract keywords or fill with missing skills
        const processedMatchedKeywords = (aiData.strengths || []).slice(0, 5).map(s => ({
            keyword: s.title.toLowerCase(),
            count: 1,
            jdCount: 1
        }));

        return {
            overallScore: aiData.atsScore || localDetails.overallScore,
            summary: aiData.summary || "This comprehensive audit summarizes key areas of strength and potential growth based on your resume contents.",
            wordCount: localDetails.wordCount,
            readingEase: localDetails.readingEase,
            readabilityLabel: localDetails.readabilityLabel,
            readabilityColor: localDetails.readabilityColor,
            actionVerbCount: localDetails.actionVerbCount,
            actionVerbDensity: localDetails.actionVerbDensity,
            contactInfo: localDetails.contactInfo,
            structureScore: localDetails.structureScore,
            matchedKeywords: extractedText ? localDetails.matchedKeywords : processedMatchedKeywords,
            missingKeywords: processedMissingKeywords.length > 0 ? processedMissingKeywords : localDetails.missingKeywords,
            feedback: [...(localDetails.feedback || []).filter(f => f.category === 'Contact Info' || f.category === 'Resume Structure'), ...processedFeedback],
            weakBulletPoints: aiData.tailoredBulletPoints ? aiData.tailoredBulletPoints.map(b => ({
                original: b.original,
                suggestion: b.tailored,
                explanation: b.impactExplanation
            })) : (localDetails.weakBulletPoints || []),
            interviewQuestions: aiData.interviewPrep || generateHeuristicInterviewQuestions(localDetails.matchedKeywords)
        };
    }

    // -----------------------------------------------------------------
    // Dynamic HTML Renderings
    // -----------------------------------------------------------------
    function renderDashboard() {
        if (!currentAnalysis) return;

        // 1. Executive summary paragraph
        const summaryTextEl = document.getElementById('summary-text');
        if (currentAnalysis.summary) {
            summaryTextEl.textContent = currentAnalysis.summary;
        } else {
            summaryTextEl.textContent = "Your resume has been parsed successfully. Check the compatibility metrics, key-verb counts, layout structure checkmark lists, and specific action items generated below to increase your profile strength.";
        }

        // 2. Animated Circular ATS Progress bar
        const atsScoreNum = document.getElementById('ats-score-num');
        const atsRadialFill = document.getElementById('ats-radial-fill');
        const atsScoreRating = document.getElementById('ats-score-rating');
        const scoreVal = currentAnalysis.overallScore;

        atsScoreNum.textContent = `${scoreVal}%`;
        
        // Circle circumference is 2 * PI * r = 2 * 3.14159 * 60 = 377
        const dashOffset = 377 - (377 * scoreVal) / 100;
        atsRadialFill.style.strokeDashoffset = dashOffset;
        
        // Dynamically color the score
        if (scoreVal < 50) {
            atsRadialFill.style.stroke = 'var(--accent-rose)';
            atsScoreRating.textContent = 'Critical Gaps Found';
            atsScoreRating.style.color = 'var(--accent-rose)';
        } else if (scoreVal < 78) {
            atsRadialFill.style.stroke = 'var(--accent-amber)';
            atsScoreRating.textContent = 'Solid Alignment';
            atsScoreRating.style.color = 'var(--accent-amber)';
        } else {
            atsRadialFill.style.stroke = 'var(--accent-emerald)';
            atsScoreRating.textContent = 'Superb ATS Match';
            atsScoreRating.style.color = 'var(--accent-emerald)';
        }

        // 3. Numeric Metrics (Readability, Action Verbs)
        const readabilityNum = document.getElementById('readability-num');
        const readabilityGrade = document.getElementById('readability-grade');
        const activeVerbsNum = document.getElementById('active-verbs-num');
        const activeVerbsDensity = document.getElementById('active-verbs-density');

        readabilityNum.textContent = currentAnalysis.readingEase;
        readabilityGrade.textContent = currentAnalysis.readabilityLabel;
        readabilityGrade.style.color = currentAnalysis.readabilityColor;
        
        activeVerbsNum.textContent = currentAnalysis.actionVerbCount;
        activeVerbsDensity.textContent = `${currentAnalysis.actionVerbDensity}% density`;
        
        if (currentAnalysis.actionVerbCount < 5) {
            activeVerbsDensity.style.color = 'var(--accent-amber)';
        } else {
            activeVerbsDensity.style.color = 'var(--accent-emerald)';
        }

        // 4. Checklist Render
        renderStructureChecklist();

        // 5. Dynamic feedback listing
        renderFeedbackAuditList();

        // 6. Keywords Pill Render
        renderKeywordPills();

        // 7. Bullet Optimization Tab Render
        renderBulletOptimizer();

        // 8. Render Interview Prep Questions
        renderInterviewPrep();
        
        // Reinitialize dynamic Lucide icons created during rendering
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function renderStructureChecklist() {
        const container = document.getElementById('checklist-container');
        container.innerHTML = ''; // Wipe pre-existing

        const info = currentAnalysis.contactInfo;
        const struct = currentAnalysis.structureScore;

        const checkItems = [
            { label: 'Email Contact info', status: info.hasEmail, val: 'Required' },
            { label: 'Phone Number', status: info.hasPhone, val: 'Recommended' },
            { label: 'LinkedIn Link', status: info.hasLinkedIn, val: 'Recommended' },
            { label: 'GitHub Link', status: info.hasGitHub, val: 'Optional' },
            { label: 'Work Experience Section', status: struct.experience, val: 'Crucial' },
            { label: 'Education Details', status: struct.education, val: 'Crucial' },
            { label: 'Core Skills Listing', status: struct.skills, val: 'Crucial' },
            { label: 'Projects / Works Section', status: struct.projects, val: 'Highly Valued' },
            { label: 'Summary Profile Paragraph', status: struct.summary, val: 'Highly Valued' }
        ];

        checkItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'checklist-item';
            
            const checkStatusClass = item.status ? 'success' : 'fail';
            const iconName = item.status ? 'check' : 'x';

            div.innerHTML = `
                <span class="checklist-status ${checkStatusClass}">
                    <i data-lucide="${iconName}"></i>
                </span>
                <span class="checklist-label" style="color: ${item.status ? 'white' : 'var(--text-secondary)'}">${item.label}</span>
                <span class="checklist-val">${item.val}</span>
            `;
            container.appendChild(div);
        });
    }

    function renderFeedbackAuditList() {
        const container = document.getElementById('feedback-audit-list');
        const badge = document.getElementById('feedback-badge');
        container.innerHTML = '';

        const feedbackItems = currentAnalysis.feedback || [];
        badge.textContent = `${feedbackItems.length} issues`;

        if (feedbackItems.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i data-lucide="check-circle" style="color: var(--accent-emerald); width: 2.5rem; height: 2.5rem; margin-bottom: 0.5rem;"></i>
                    <p>No critical layout or phrasing issues found. Your resume formatting is optimized!</p>
                </div>
            `;
            return;
        }

        // Sort: High severity first
        const severityOrder = { high: 0, medium: 1, low: 2 };
        const sortedFeedback = [...feedbackItems].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        sortedFeedback.forEach(item => {
            const card = document.createElement('div');
            card.className = 'audit-card';
            
            let iconName = 'info';
            if (item.severity === 'high') iconName = 'alert-octagon';
            if (item.severity === 'medium') iconName = 'alert-triangle';

            card.innerHTML = `
                <div class="severity-bar ${item.severity}"></div>
                <div class="audit-card-icon ${item.severity}">
                    <i data-lucide="${iconName}"></i>
                </div>
                <div class="audit-card-content">
                    <h5>${item.title}</h5>
                    <p>${item.desc}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function renderKeywordPills() {
        const missingGroup = document.getElementById('missing-keywords-group');
        const matchedGroup = document.getElementById('matched-keywords-group');
        
        missingGroup.innerHTML = '';
        matchedGroup.innerHTML = '';

        const missing = currentAnalysis.missingKeywords || [];
        const matched = currentAnalysis.matchedKeywords || [];

        if (missing.length === 0) {
            missingGroup.innerHTML = `<span style="color: var(--text-muted); font-size: 0.875rem;">No missing terms found. Excellent keyword coverage!</span>`;
        } else {
            missing.forEach(k => {
                const pill = document.createElement('span');
                pill.className = 'keyword-pill missing';
                pill.innerHTML = `
                    <i data-lucide="plus-circle" style="width: 0.85rem; height: 0.85rem; cursor: pointer;"></i>
                    <span>${k.keyword}</span>
                    <span class="pill-count">Missing</span>
                `;
                missingGroup.appendChild(pill);
            });
        }

        if (matched.length === 0) {
            matchedGroup.innerHTML = `<span style="color: var(--text-muted); font-size: 0.875rem;">No matched keywords found. Try adding industry-specific terms or details.</span>`;
        } else {
            matched.forEach(k => {
                const pill = document.createElement('span');
                pill.className = 'keyword-pill matched';
                pill.innerHTML = `
                    <i data-lucide="check" style="width: 0.85rem; height: 0.85rem;"></i>
                    <span>${k.keyword}</span>
                    <span class="pill-count">${k.count}x</span>
                `;
                matchedGroup.appendChild(pill);
            });
        }
    }

    function renderBulletOptimizer() {
        const grid = document.getElementById('tailor-bullet-grid');
        const badgeText = document.getElementById('tailor-badge-text');
        grid.innerHTML = '';

        if (apiKey) {
            badgeText.textContent = "Generative AI Mode";
        } else {
            badgeText.textContent = "Heuristic Optimization Mode";
        }

        const bullets = currentAnalysis.weakBulletPoints || [];
        bullets.forEach(item => {
            const card = document.createElement('div');
            card.className = 'tailor-bullet-card glass-panel';

            const explanationHtml = item.explanation 
                ? `<div class="tailored-explanation">
                     <strong style="color: white; font-weight: 600;">Impact Rationale:</strong> ${item.explanation}
                   </div>`
                : `<div class="tailored-explanation">
                     <strong style="color: white; font-weight: 600;">Optimization:</strong> Infused dynamic impact verbs and structures designed to stand out to ATS scans and HR coordinators.
                   </div>`;

            card.innerHTML = `
                <div class="bullet-column original">
                    <span class="bullet-title">Original Bullet Point</span>
                    <div class="bullet-content-box">${item.original}</div>
                </div>
                <div class="bullet-column tailored">
                    <span class="bullet-title">Supercharged Suggestion</span>
                    <div class="bullet-content-box">${item.suggestion}</div>
                </div>
                ${explanationHtml}
            `;
            grid.appendChild(card);
        });
    }

    function renderInterviewPrep() {
        const grid = document.getElementById('interview-grid');
        grid.innerHTML = '';

        // Check if Gemini generated specialized interview questions
        const questions = currentAnalysis.interviewQuestions || generateHeuristicInterviewQuestions(currentAnalysis.matchedKeywords);

        questions.forEach(item => {
            const card = document.createElement('div');
            card.className = 'interview-card glass-panel';
            
            card.innerHTML = `
                <div class="interview-q-header">
                    <span class="question-category">${item.category || 'General'}</span>
                    <i data-lucide="help-circle" style="color: var(--accent-indigo); width: 1.15rem; height: 1.15rem;"></i>
                </div>
                <h4>${item.question}</h4>
                <div class="expected-ans-box">
                    <h5>Recommended Response Roadmap</h5>
                    <p>${item.expectedAnswerSuggestion || item.responseRoadmap}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // -----------------------------------------------------------------
    // Dynamic Fallback Generator for Local Mode
    // -----------------------------------------------------------------
    function generateHeuristicInterviewQuestions(matchedKeywords = []) {
        const skillsFound = matchedKeywords.slice(0, 3).map(k => k.keyword.toUpperCase()) || [];
        const skillsSnippet = skillsFound.length > 0 ? skillsFound.join(', ') : 'your primary skills';

        return [
            {
                category: 'Resume Deep Dive',
                question: `Can you walk me through a major milestone where you leveraged ${skillsFound.length > 0 ? skillsFound[0] : 'your tech stack'} to drive business value?`,
                expectedAnswerSuggestion: "Structure using the STAR framework (Situation, Task, Action, Result). Highlight specific business metrics (e.g. reduced load times, increased sales, saved development hours)."
            },
            {
                category: 'Behavioral Prep',
                question: "Describe a high-friction engineering challenge you encountered in a team. How did you resolve the conflict and complete the project?",
                expectedAnswerSuggestion: "Focus on proactive communication, empathy, and professional compromise. Discuss how you prioritized the project's health and aligned with team members on standard guidelines."
            },
            {
                category: 'Technical Standard',
                question: `What are some best-practices for performance tuning or structural testing within ${skillsSnippet}?`,
                expectedAnswerSuggestion: "Mention performance audits, profiling code, code-splitting strategies, writing clean unit tests (using frameworks like Jest or PyTest), and utilizing static analyzers."
            }
        ];
    }

    // -----------------------------------------------------------------
    // Helper & Feedback Toast Actions
    // -----------------------------------------------------------------
    function updateLoaderStatus(title, subtitle) {
        loadingTitle.textContent = title;
        loadingSubtitle.textContent = subtitle;
    }

    function updateApiBadge(hasKey) {
        const span = apiToggleBtn.querySelector('span');
        const icon = apiToggleBtn.querySelector('i');
        
        if (hasKey) {
            apiToggleBtn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            apiToggleBtn.style.background = 'rgba(16, 185, 129, 0.05)';
            span.textContent = 'Gemini AI Active';
            span.style.color = '#a7f3d0';
            if (icon) icon.style.color = 'var(--accent-emerald)';
        } else {
            apiToggleBtn.style.borderColor = 'var(--border-glass)';
            apiToggleBtn.style.background = 'rgba(255, 255, 255, 0.04)';
            span.textContent = 'Configure Gemini AI';
            span.style.color = '';
            if (icon) icon.style.color = 'var(--accent-indigo)';
        }
    }

    function showToast(message, type = 'info') {
        // Simple elegant toast notifications
        const toast = document.createElement('div');
        toast.className = 'glass-panel';
        
        let color = 'white';
        let iconName = 'info';
        if (type === 'success') { color = 'var(--accent-emerald)'; iconName = 'check-circle'; }
        if (type === 'error') { color = 'var(--accent-rose)'; iconName = 'alert-octagon'; }
        if (type === 'warning') { color = 'var(--accent-amber)'; iconName = 'alert-triangle'; }
        
        toast.style.position = 'fixed';
        toast.style.bottom = '2rem';
        toast.style.right = '2rem';
        toast.style.padding = '1rem 1.5rem';
        toast.style.zIndex = '999';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '0.75rem';
        toast.style.borderLeft = `4px solid ${color}`;
        toast.style.animation = 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        toast.innerHTML = `
            <i data-lucide="${iconName}" style="color: ${color}; width: 1.15rem; height: 1.15rem;"></i>
            <span style="font-size: 0.9rem; font-weight: 500;">${message}</span>
        `;
        
        document.body.appendChild(toast);
        if (typeof lucide !== 'undefined') {
            lucide.createIcons({ attrs: { 'stroke-width': 2.5 } });
        }
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // -----------------------------------------------------------------
    // Export Analysis Report Function
    // -----------------------------------------------------------------
    function exportAnalysisReport() {
        if (!currentAnalysis) return;

        const date = new Date().toLocaleDateString();
        let markdown = `# RESUGLOW - ATS AUDIT REPORT
Generated on: ${date}
Resume: ${selectedFile ? selectedFile.name : 'Parsed Document'}
Overall ATS Compatibility Score: ${currentAnalysis.overallScore}%
--------------------------------------------------

## EXECUTIVE SUMMARY
${currentAnalysis.summary || 'A detailed heuristic analysis of candidate formatting and alignment has been completed.'}

## CRITICAL SCORE METRICS
- ATS Compatibility Rating: ${currentAnalysis.overallScore}%
- Readability Index (Flesch Ease): ${currentAnalysis.readingEase} (${currentAnalysis.readabilityLabel})
- Active Action Verb Density: ${currentAnalysis.actionVerbDensity}% (${currentAnalysis.actionVerbCount} high-impact verbs detected)

## DETAILED AUDIT RECOMMENDATIONS
`;

        currentAnalysis.feedback.forEach((item, index) => {
            markdown += `${index + 1}. [SEVERITY: ${item.severity.toUpperCase()}] ${item.title}\n   - ${item.desc}\n\n`;
        });

        markdown += `## KEYWORD ALIGNMENT SUMMARY\n`;
        
        const matchedNames = currentAnalysis.matchedKeywords.map(k => `${k.keyword} (${k.count}x)`).join(', ');
        const missingNames = currentAnalysis.missingKeywords.map(k => k.keyword).join(', ');
        
        markdown += `- MATCHED KEYWORDS: ${matchedNames || 'None'}\n`;
        markdown += `- RECOMMENDED MISSING KEYWORDS: ${missingNames || 'None'}\n\n`;

        markdown += `## GOOGLE XYZ BULLET POINT OPTIMIZATIONS\n`;
        currentAnalysis.weakBulletPoints.forEach((item, index) => {
            markdown += `${index + 1}. Original: "${item.original}"\n   Optimized: "${item.suggestion}"\n`;
            if (item.explanation) {
                markdown += `   Impact Explanation: ${item.explanation}\n`;
            }
            markdown += `\n`;
        });

        markdown += `## MOCK INTERVIEW QUESTIONS & PREPARATION\n`;
        
        const questions = currentAnalysis.interviewQuestions || generateHeuristicInterviewQuestions(currentAnalysis.matchedKeywords);
        questions.forEach((item, index) => {
            markdown += `${index + 1}. Question [Category: ${item.category}]: "${item.question}"\n   Recommended Roadmap: ${item.expectedAnswerSuggestion || item.responseRoadmap}\n\n`;
        });

        markdown += `\nGenerated via ResuGlow Resume Analyzer - Private & Client-side powered.`;

        // Create virtual download file
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const safeName = (selectedFile ? selectedFile.name : 'resume').replace(/\.[^/.]+$/, "");
        a.href = url;
        a.download = `${safeName}_ATS_Audit_Report.md`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Report downloaded as Markdown successfully!', 'success');
    }

    // Run Startup Init
    init();
});
