/**
 * Advanced job information extraction utility
 * Uses multiple strategies to extract job title and company from web pages
 * PRIORITY: Page title and H1 elements first, then other methods
 */

export interface JobExtractionResult {
  title: string;
  company: string;
  confidence: number;
  method: string;
  url: string;
  source: string;
}

interface ExtractionStrategy {
  name: string;
  priority: number; // Higher number = higher priority
  extract: () => { title: string; company: string; confidence: number } | null;
}

export class JobExtractor {
  private strategies: ExtractionStrategy[] = [];

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    this.strategies = [
      {
        name: 'page-title-priority',
        priority: 100, // HIGHEST PRIORITY
        extract: this.extractFromPageTitlePriority.bind(this)
      },
      {
        name: 'h1-elements',
        priority: 95, // SECOND HIGHEST
        extract: this.extractFromH1Elements.bind(this)
      },
      {
        name: 'structured-data',
        priority: 90,
        extract: this.extractFromStructuredData.bind(this)
      },
      {
        name: 'dom-elements',
        priority: 85,
        extract: this.extractFromDOMElements.bind(this)
      },
      {
        name: 'meta-tags',
        priority: 70,
        extract: this.extractFromMetaTags.bind(this)
      },
      {
        name: 'url-patterns',
        priority: 50,
        extract: this.extractFromURL.bind(this)
      }
    ];

    // Sort strategies by priority (highest first)
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  public extractJobInfo(): JobExtractionResult {
    let bestResult: { title: string; company: string; confidence: number; method: string } = {
      title: 'Unknown Position',
      company: 'Unknown Company',
      confidence: 0,
      method: 'fallback'
    };

    console.log('🔍 Starting job extraction...');
    console.log('📄 Page title:', document.title);
    console.log('📄 Page URL:', window.location.href);

    // Try each strategy in priority order
    for (const strategy of this.strategies) {
      try {
        console.log(`🔍 Trying strategy: ${strategy.name} (priority: ${strategy.priority})`);
        const result = strategy.extract();
        
        if (result) {
          console.log(`✅ ${strategy.name} found:`, result);
          
          // If we get a high-confidence result from a high-priority strategy, use it immediately
          if (result.confidence >= 80 && strategy.priority >= 90) {
            bestResult = { ...result, method: strategy.name };
            console.log(`🎯 Using high-confidence result from ${strategy.name}`);
            break;
          }
          
          // Otherwise, keep the best result so far
          if (result.confidence > bestResult.confidence) {
            bestResult = { ...result, method: strategy.name };
          }
        } else {
          console.log(`❌ ${strategy.name} found nothing`);
        }
      } catch (error) {
        console.warn(`⚠️ Strategy ${strategy.name} failed:`, error);
      }
    }

    console.log('🎯 Final result:', bestResult);

    return {
      title: bestResult.title,
      company: bestResult.company,
      confidence: bestResult.confidence,
      method: bestResult.method,
      url: window.location.href,
      source: window.location.hostname
    };
  }

  private extractFromPageTitlePriority(): { title: string; company: string; confidence: number } | null {
    const pageTitle = document.title;
    if (!pageTitle) return null;

    console.log('📄 Analyzing page title:', pageTitle);

    // Enhanced patterns with better parsing - PRIORITIZE THESE FIRST
    const patterns = [
      // "Job Application for Senior Technical Writer at Anduril Industries"
      {
        regex: /^(?:Job Application for\s+)?(.+?)\s+at\s+(.+?)(?:\s*[-|•].*)?$/i,
        titleIndex: 1,
        companyIndex: 2,
        confidence: 95,
        name: 'job-application-at'
      },
      
      // "Binance - Senior Frontend Engineer - KYC Saas" (company first)
      {
        regex: /^([A-Z][a-zA-Z\s&.-]{1,30})\s*[-–—]\s*(.+?)(?:\s*[-–—].*)?$/i,
        titleIndex: 2,
        companyIndex: 1,
        confidence: 90,
        name: 'company-dash-title',
        validate: true // We'll validate this looks right
      },
      
      // "Senior Software Engineer at Google"
      {
        regex: /^(.+?)\s+at\s+(.+?)(?:\s*[-|•].*)?$/i,
        titleIndex: 1,
        companyIndex: 2,
        confidence: 88,
        name: 'title-at-company'
      },
      
      // "Google - Senior Software Engineer"
      {
        regex: /^([^-]+?)\s*[-–—]\s*(.+?)(?:\s*[-|•].*)?$/i,
        titleIndex: 2,
        companyIndex: 1,
        confidence: 85,
        name: 'company-dash-title-generic',
        validate: true
      },
      
      // "Job Title | Company Name"
      {
        regex: /^(.+?)\s*\|\s*(.+?)(?:\s*[-|•].*)?$/i,
        titleIndex: 1,
        companyIndex: 2,
        confidence: 82,
        name: 'title-pipe-company'
      },
      
      // "Company Name: Job Title"
      {
        regex: /^(.+?):\s*(.+?)(?:\s*[-|•].*)?$/i,
        titleIndex: 2,
        companyIndex: 1,
        confidence: 80,
        name: 'company-colon-title'
      }
    ];

    for (const pattern of patterns) {
      const match = pageTitle.match(pattern.regex);
      if (match) {
        let title = this.cleanText(match[pattern.titleIndex]);
        let company = this.cleanText(match[pattern.companyIndex]);

        console.log(`📄 Pattern "${pattern.name}" matched - Raw: title="${title}", company="${company}"`);

        // Validation for ambiguous patterns
        if (pattern.validate) {
          // For "Company - Title" patterns, validate the first part looks like a company
          if (!this.looksLikeCompany(company) && this.looksLikeJobTitle(company)) {
            console.log(`📄 Swapping because "${company}" looks more like a job title`);
            [title, company] = [company, title];
          }
          
          // Additional validation: if title looks like a company and company looks like a title, swap
          if (this.looksLikeCompany(title) && this.looksLikeJobTitle(company)) {
            console.log(`📄 Swapping because "${title}" looks like company and "${company}" looks like title`);
            [title, company] = [company, title];
          }
        }

        // Final validation that we have meaningful content
        if (title && company && title.length > 2 && company.length > 2) {
          // Remove common job board suffixes from company names
          company = company.replace(/\s*[-|]\s*(Jobs?|Careers?|Hiring|Apply).*$/i, '').trim();
          
          console.log(`📄 Final result from "${pattern.name}": "${title}" at "${company}"`);
          return { title, company, confidence: pattern.confidence };
        }
      }
    }

    return null;
  }

  private extractFromH1Elements(): { title: string; company: string; confidence: number } | null {
    const h1Elements = document.querySelectorAll('h1');
    
    console.log(`📄 Found ${h1Elements.length} H1 elements`);

    for (const h1 of h1Elements) {
      const text = h1.textContent?.trim();
      if (!text) continue;

      console.log('📄 H1 text:', text);

      // Look for job title patterns in H1
      const jobTitleIndicators = [
        'engineer', 'developer', 'manager', 'director', 'analyst', 'specialist',
        'coordinator', 'lead', 'senior', 'junior', 'principal', 'architect',
        'designer', 'consultant', 'associate', 'executive', 'intern', 'writer',
        'administrator', 'supervisor', 'officer', 'representative', 'technician'
      ];

      const looksLikeJobTitle = jobTitleIndicators.some(indicator => 
        text.toLowerCase().includes(indicator)
      );

      if (looksLikeJobTitle) {
        // Try to find company name nearby
        const company = this.findCompanyNearH1(h1);
        
        if (company) {
          console.log(`📄 H1 job title found: "${text}" at "${company}"`);
          return {
            title: this.cleanText(text),
            company: this.cleanText(company),
            confidence: 88
          };
        }
      }
    }

    return null;
  }

  private findCompanyNearH1(h1Element: Element): string | null {
    // Look for company name in nearby elements
    const searchElements = [
      // Next sibling
      h1Element.nextElementSibling,
      // Parent's next sibling
      h1Element.parentElement?.nextElementSibling,
      // Look for specific company selectors near the H1
      h1Element.parentElement?.querySelector('.company, [class*="company"], [data-testid*="company"]')
    ];

    for (const element of searchElements) {
      if (element && element.textContent) {
        const text = element.textContent.trim();
        if (text && text.length > 1 && text.length < 100) {
          // Check if it looks like a company name
          if (this.looksLikeCompany(text) || text.match(/^[A-Z][a-zA-Z\s&.-]+$/)) {
            return text;
          }
        }
      }
    }

    return null;
  }

  private extractFromStructuredData(): { title: string; company: string; confidence: number } | null {
    // Look for JSON-LD structured data
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        
        if (data['@type'] === 'JobPosting') {
          const title = data.title || data.name;
          const company = data.hiringOrganization?.name || data.employer?.name;
          
          if (title && company) {
            return {
              title: this.cleanText(title),
              company: this.cleanText(company),
              confidence: 95
            };
          }
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  private extractFromDOMElements(): { title: string; company: string; confidence: number } | null {
    const selectors = {
      title: [
        // LinkedIn
        'h1[data-test-job-title]',
        '.job-details-jobs-unified-top-card__job-title h1',
        
        // Indeed
        'h1[data-jk]',
        '.jobsearch-JobInfoHeader-title',
        
        // Greenhouse
        'h1.app-title',
        '.job-post-header h1',
        
        // Lever
        '.posting-headline h2',
        
        // AngelList
        '.job-title',
        
        // Generic selectors
        'h1[data-testid*="job-title"]',
        'h1[class*="job-title"]',
        'h1[class*="title"]',
        '.job-header h1',
        '[data-testid="jobTitle"]'
      ],
      company: [
        // LinkedIn
        '.job-details-jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name',
        
        // Indeed
        '[data-testid="inlineHeader-companyName"] a',
        '.jobsearch-InlineCompanyRating .icl-u-lg-mr--sm',
        
        // Greenhouse
        '.company-name',
        '.job-post-header .company',
        
        // Lever
        '.posting-headline .sort-by-time',
        
        // AngelList
        '.company-name',
        
        // Generic selectors
        '[data-testid*="company"]',
        '[class*="company-name"]',
        '.job-header .company',
        'a[data-testid="job-company-name"]'
      ]
    };

    let title = '';
    let company = '';

    // Extract title
    for (const selector of selectors.title) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        title = this.cleanText(element.textContent);
        console.log(`📄 Found title via selector "${selector}": "${title}"`);
        break;
      }
    }

    // Extract company
    for (const selector of selectors.company) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        company = this.cleanText(element.textContent);
        console.log(`📄 Found company via selector "${selector}": "${company}"`);
        break;
      }
    }

    if (title && company) {
      return { title, company, confidence: 85 };
    } else if (title || company) {
      return { 
        title: title || 'Unknown Position', 
        company: company || 'Unknown Company', 
        confidence: 50 
      };
    }

    return null;
  }

  private extractFromMetaTags(): { title: string; company: string; confidence: number } | null {
    const metaSelectors = [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'meta[property="og:site_name"]',
      'meta[name="application-name"]'
    ];

    let title = '';
    let company = '';

    for (const selector of metaSelectors) {
      const meta = document.querySelector(selector) as HTMLMetaElement;
      if (meta && meta.content) {
        const content = this.cleanText(meta.content);
        
        if (selector.includes('title') && !title) {
          title = content;
        } else if (selector.includes('site_name') && !company) {
          company = content;
        }
      }
    }

    if (title && company) {
      return { title, company, confidence: 60 };
    }

    return null;
  }

  private extractFromURL(): { title: string; company: string; confidence: number } | null {
    const url = window.location.href;
    const hostname = window.location.hostname;

    // Extract company from hostname
    let company = '';
    
    if (hostname.includes('linkedin.com')) {
      company = 'LinkedIn Job';
    } else if (hostname.includes('indeed.com')) {
      company = 'Indeed Job';
    } else if (hostname.includes('glassdoor.com')) {
      company = 'Glassdoor Job';
    } else {
      // Try to extract company from subdomain or path
      const parts = hostname.split('.');
      if (parts.length > 2) {
        company = this.capitalizeWords(parts[0]);
      }
    }

    // Try to extract job info from URL path
    const pathMatch = url.match(/\/jobs?\/([^\/]+)/i);
    if (pathMatch) {
      const jobSlug = pathMatch[1].replace(/[-_]/g, ' ');
      return {
        title: this.capitalizeWords(jobSlug),
        company: company || 'Unknown Company',
        confidence: 30
      };
    }

    return null;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s&.-]/g, '')
      .trim();
  }

  private looksLikeCompany(text: string): boolean {
    const companyIndicators = [
      'inc', 'corp', 'llc', 'ltd', 'company', 'technologies', 'tech', 'systems',
      'solutions', 'group', 'enterprises', 'labs', 'studio', 'agency', 'consulting',
      'partners', 'associates', 'holdings', 'ventures', 'capital', 'industries'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Check for company indicators
    const hasIndicator = companyIndicators.some(indicator => lowerText.includes(indicator));
    
    // Check for typical company name patterns (single capitalized words)
    const hasCapitalizedWords = /^[A-Z][a-zA-Z]*(\s+[A-Z][a-zA-Z]*)*$/.test(text.trim());
    
    // Shorter text is more likely to be a company name
    const isShort = text.length < 50;
    
    // Known company names (you can expand this list)
    const knownCompanies = ['binance', 'google', 'apple', 'microsoft', 'amazon', 'meta', 'netflix', 'tesla', 'anduril'];
    const isKnownCompany = knownCompanies.some(company => lowerText.includes(company));
    
    return hasIndicator || isKnownCompany || (hasCapitalizedWords && isShort);
  }

  private looksLikeJobTitle(text: string): boolean {
    const jobTitleIndicators = [
      'engineer', 'developer', 'manager', 'director', 'analyst', 'specialist',
      'coordinator', 'lead', 'senior', 'junior', 'principal', 'architect',
      'designer', 'consultant', 'associate', 'executive', 'intern', 'writer',
      'administrator', 'supervisor', 'officer', 'representative', 'technician',
      'frontend', 'backend', 'fullstack', 'software', 'technical', 'product',
      'marketing', 'sales', 'operations', 'finance', 'hr', 'legal'
    ];
    
    const lowerText = text.toLowerCase();
    return jobTitleIndicators.some(indicator => lowerText.includes(indicator));
  }

  private capitalizeWords(text: string): string {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

// Export a singleton instance
export const jobExtractor = new JobExtractor();

// Export the main extraction function
export const extractJobInfo = (): JobExtractionResult => {
  return jobExtractor.extractJobInfo();
};