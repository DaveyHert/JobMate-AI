import React, { useState } from 'react';
import { 
  Brain, 
  FileText, 
  Target, 
  Wand2, 
  Download, 
  Copy, 
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Eye,
  PenTool
} from 'lucide-react';

interface JobAnalysis {
  score: number;
  matches: string[];
  missing: string[];
  recommendations: string[];
  keyRequirements: Array<{
    requirement: string;
    match: boolean;
  }>;
}

interface CoverLetterData {
  content: string;
  tone: 'professional' | 'enthusiastic' | 'casual' | 'assertive';
  generatedAt: string;
}

interface AIFeaturesProps {
  activeProfile: any;
  onClose: () => void;
  feature: 'cover-letter' | 'job-fit' | 'resume-tailor' | 'answer-generator';
}

const AIFeatures: React.FC<AIFeaturesProps> = ({ activeProfile, onClose, feature }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [selectedTone, setSelectedTone] = useState<CoverLetterData['tone']>('professional');
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [question, setQuestion] = useState('');

  const handleAnalyzeJobFit = async () => {
    if (!jobDescription.trim()) {
      alert('Please paste the job description first');
      return;
    }

    setIsLoading(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis: JobAnalysis = {
        score: Math.floor(Math.random() * 30) + 70, // 70-100%
        matches: ['React', 'TypeScript', 'Product Management', 'Agile', 'Data Analysis'],
        missing: ['Python', 'Machine Learning', 'AWS'],
        recommendations: [
          'Highlight your React and TypeScript experience prominently',
          'Mention any data analysis projects you\'ve worked on',
          'Emphasize your product management methodology experience',
          'Consider taking an AWS certification course',
          'Add any Python or ML projects to strengthen your profile'
        ],
        keyRequirements: [
          { requirement: 'Bachelor\'s degree in relevant field', match: true },
          { requirement: '3+ years of product management experience', match: true },
          { requirement: 'Experience with React/TypeScript', match: true },
          { requirement: 'Data analysis and SQL skills', match: true },
          { requirement: 'Python programming experience', match: false },
          { requirement: 'Machine learning knowledge', match: false },
          { requirement: 'Cloud platforms (AWS/GCP)', match: false }
        ]
      };
      
      setResult(mockAnalysis);
      setIsLoading(false);
    }, 2000);
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      alert('Please paste the job description first');
      return;
    }

    setIsLoading(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const mockCoverLetter: CoverLetterData = {
        content: `Dear Hiring Manager,

I am writing to express my strong interest in the ${extractJobTitle(jobDescription) || 'position'} role at your company. With ${activeProfile?.professional?.experience || '5+ years'} of experience in ${activeProfile?.professional?.title || 'product management'}, I am confident that my skills and background make me an ideal candidate for this position.

In my current role as ${activeProfile?.professional?.title || 'Senior Product Manager'}, I have successfully led cross-functional teams to deliver innovative products that drive user engagement and business growth. My expertise in ${activeProfile?.professional?.skills?.slice(0, 3).join(', ') || 'product strategy, data analysis, and user research'} aligns perfectly with the requirements outlined in your job description.

I am particularly excited about this opportunity because it combines my passion for ${getRandomPassion()} with the chance to work on cutting-edge products that make a real impact. I believe my experience in ${getRandomExperience()} would allow me to contribute immediately to your team's success.

Thank you for considering my application. I look forward to discussing how my background and enthusiasm can contribute to your organization's continued growth and innovation.

Best regards,
${activeProfile?.personalInfo?.firstName || 'John'} ${activeProfile?.personalInfo?.lastName || 'Doe'}`,
        tone: selectedTone,
        generatedAt: new Date().toISOString()
      };
      
      setResult(mockCoverLetter);
      setIsLoading(false);
    }, 3000);
  };

  const handleTailorResume = async () => {
    if (!jobDescription.trim()) {
      alert('Please paste the job description first');
      return;
    }

    setIsLoading(true);
    
    // Simulate AI resume tailoring
    setTimeout(() => {
      const mockSuggestions = {
        skillsToAdd: ['Data-driven decision making', 'Cross-functional collaboration', 'A/B testing'],
        skillsToEmphasize: ['Product strategy', 'User research', 'Agile methodology'],
        experienceAdjustments: [
          'Quantify your impact with specific metrics (e.g., "Increased user engagement by 25%")',
          'Highlight experience with similar company size or industry',
          'Emphasize leadership and team management experience'
        ],
        keywordOptimization: [
          'Include "product-market fit" in your experience descriptions',
          'Use "stakeholder management" instead of "team coordination"',
          'Add "growth metrics" and "KPI tracking" to your skill set'
        ]
      };
      
      setResult(mockSuggestions);
      setIsLoading(false);
    }, 2500);
  };

  const handleGenerateAnswer = async () => {
    if (!question.trim()) {
      alert('Please enter a question first');
      return;
    }

    setIsLoading(true);
    
    // Simulate AI answer generation
    setTimeout(() => {
      const mockAnswer = generateMockAnswer(question, activeProfile);
      setResult({ answer: mockAnswer, question });
      setIsLoading(false);
    }, 2000);
  };

  const extractJobTitle = (description: string): string => {
    // Simple extraction - in real implementation, use more sophisticated NLP
    const titleMatch = description.match(/(?:position|role|job):\s*([^\n]+)/i);
    return titleMatch ? titleMatch[1].trim() : '';
  };

  const getRandomPassion = (): string => {
    const passions = ['building user-centric products', 'solving complex problems', 'driving innovation', 'creating meaningful user experiences'];
    return passions[Math.floor(Math.random() * passions.length)];
  };

  const getRandomExperience = (): string => {
    const experiences = ['leading product launches', 'data-driven product decisions', 'cross-functional team leadership', 'user research and validation'];
    return experiences[Math.floor(Math.random() * experiences.length)];
  };

  const generateMockAnswer = (question: string, profile: any): string => {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('strength') || questionLower.includes('strong')) {
      return `One of my key strengths is my ability to bridge the gap between technical and business teams. In my role as ${profile?.professional?.title || 'Product Manager'}, I've consistently demonstrated strong analytical thinking and communication skills. For example, I led a cross-functional initiative that resulted in a 30% increase in user engagement by implementing data-driven product decisions and fostering collaboration between engineering, design, and marketing teams.`;
    }
    
    if (questionLower.includes('weakness') || questionLower.includes('improve')) {
      return `I'm always looking to improve my technical skills, particularly in emerging technologies. While I have a strong foundation in ${profile?.professional?.skills?.[0] || 'product strategy'}, I've been actively learning about machine learning and AI to better understand how these technologies can enhance our products. I've enrolled in online courses and have been working on side projects to deepen my understanding in this area.`;
    }
    
    if (questionLower.includes('why') && (questionLower.includes('company') || questionLower.includes('role'))) {
      return `I'm excited about this opportunity because it aligns perfectly with my passion for building products that make a real impact. Your company's mission to [company mission] resonates strongly with my values, and I'm particularly impressed by [specific company achievement]. The role offers the perfect combination of strategic thinking and hands-on execution that I thrive in, and I believe my experience in ${profile?.professional?.skills?.slice(0, 2).join(' and ') || 'product management and data analysis'} would allow me to contribute meaningfully from day one.`;
    }
    
    if (questionLower.includes('challenge') || questionLower.includes('difficult')) {
      return `One of the most challenging situations I faced was when we had to pivot our product strategy mid-development due to changing market conditions. I led the effort to re-evaluate our assumptions, conducted rapid user research, and worked with the engineering team to adjust our roadmap. Through transparent communication and collaborative problem-solving, we successfully launched a revised product that exceeded our original success metrics by 40%.`;
    }
    
    // Default response
    return `Based on my experience as ${profile?.professional?.title || 'a product professional'}, I would approach this by leveraging my skills in ${profile?.professional?.skills?.slice(0, 3).join(', ') || 'strategic thinking, data analysis, and team collaboration'}. I believe in taking a methodical approach that combines data-driven insights with user-centered design principles to deliver optimal results.`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderFeatureContent = () => {
    switch (feature) {
      case 'cover-letter':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AI Cover Letter Generator</h2>
                <p className="text-sm text-gray-600">Generate a tailored cover letter based on the job description</p>
              </div>
            </div>

            {!result && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['professional', 'enthusiastic', 'casual', 'assertive'] as const).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`p-3 text-left border rounded-lg transition-colors ${
                          selectedTone === tone
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium capitalize">{tone}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {tone === 'professional' && 'Formal and business-appropriate'}
                          {tone === 'enthusiastic' && 'Energetic and passionate'}
                          {tone === 'casual' && 'Friendly and conversational'}
                          {tone === 'assertive' && 'Confident and direct'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={isLoading || !jobDescription.trim()}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Cover Letter...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Cover Letter
                    </>
                  )}
                </button>
              </>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Generated Cover Letter</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(result.content)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => downloadAsFile(result.content, 'cover-letter.txt')}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {result.content}
                  </pre>
                </div>
                
                <button
                  onClick={() => setResult(null)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Generate Another
                </button>
              </div>
            )}
          </div>
        );

      case 'job-fit':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Job Fit Analyzer</h2>
                <p className="text-sm text-gray-600">Analyze how well your profile matches the job requirements</p>
              </div>
            </div>

            {!result && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <button
                  onClick={handleAnalyzeJobFit}
                  disabled={isLoading || !jobDescription.trim()}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Job Fit...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Analyze Job Fit
                    </>
                  )}
                </button>
              </>
            )}

            {result && (
              <div className="space-y-6">
                {/* Fit Score */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">{result.score}%</div>
                    <div className="text-lg font-medium text-gray-900">Job Fit Score</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {result.score >= 80 ? 'Excellent match!' : 
                       result.score >= 60 ? 'Good match' : 'Moderate match'}
                    </div>
                  </div>
                </div>

                {/* Matching Skills */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Matching Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matches.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Skills to Develop
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Requirements */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Key Requirements</h3>
                  <div className="space-y-2">
                    {result.keyRequirements.map((req: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          req.match ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {req.match ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-red-600" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{req.requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Recommendations
                  </h3>
                  <div className="space-y-2">
                    {result.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Analyze Another Job
                </button>
              </div>
            )}
          </div>
        );

      case 'resume-tailor':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-lg">
                <PenTool className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Resume Tailor</h2>
                <p className="text-sm text-gray-600">Get suggestions to optimize your resume for this specific job</p>
              </div>
            </div>

            {!result && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={handleTailorResume}
                  disabled={isLoading || !jobDescription.trim()}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <PenTool className="w-5 h-5" />
                      Get Resume Suggestions
                    </>
                  )}
                </button>
              </>
            )}

            {result && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Skills to Add
                  </h3>
                  <div className="space-y-2">
                    {result.skillsToAdd.map((skill: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Skills to Emphasize
                  </h3>
                  <div className="space-y-2">
                    {result.skillsToEmphasize.map((skill: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-orange-600" />
                    Experience Adjustments
                  </h3>
                  <div className="space-y-2">
                    {result.experienceAdjustments.map((adjustment: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{adjustment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Keyword Optimization
                  </h3>
                  <div className="space-y-2">
                    {result.keywordOptimization.map((keyword: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{keyword}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Analyze Another Job
                </button>
              </div>
            )}
          </div>
        );

      case 'answer-generator':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Interview Answer Generator</h2>
                <p className="text-sm text-gray-600">Generate personalized answers to common interview questions</p>
              </div>
            </div>

            {!result && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., What are your greatest strengths? Why do you want to work here? Tell me about a challenging situation you faced..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Common Questions:</h4>
                  <div className="space-y-1">
                    {[
                      'What are your greatest strengths?',
                      'What is your biggest weakness?',
                      'Why do you want to work here?',
                      'Tell me about a challenging situation you faced',
                      'Where do you see yourself in 5 years?'
                    ].map((q, index) => (
                      <button
                        key={index}
                        onClick={() => setQuestion(q)}
                        className="block text-left text-sm text-blue-700 hover:text-blue-900 transition-colors"
                      >
                        • {q}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateAnswer}
                  disabled={isLoading || !question.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Answer...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Answer
                    </>
                  )}
                </button>
              </>
            )}

            {result && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Question:</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 italic">"{result.question}"</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">Generated Answer:</h3>
                    <button
                      onClick={() => copyToClipboard(result.answer)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{result.answer}</p>
                  </div>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Generate Another Answer
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900">AI Assistant</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          {renderFeatureContent()}
        </div>
      </div>
    </div>
  );
};

export default AIFeatures;