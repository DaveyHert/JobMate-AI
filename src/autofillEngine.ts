// Auto-fill engine for detecting and filling forms on any webpage
import { defaultUserProfile, type UserProfile } from './data/mockProfiles';

// Field type configuration interface
interface FieldTypeConfig {
  patterns: RegExp[];
  keywords: string[];
  labels: string[];
  autocomplete?: string[];
  types?: string[];
  priority: number;
}

// Comprehensive field detection with priority-based scoring
class FieldDetector {
  private fieldTypes: Record<string, FieldTypeConfig> = {
    firstName: {
      patterns: [/^first_?name$/i, /^fname$/i, /^given_?name$/i],
      keywords: ['first', 'given'],
      labels: ['first name', 'given name', 'first', 'fname'],
      autocomplete: ['given-name'],
      priority: 10
    },
    lastName: {
      patterns: [/^last_?name$/i, /^lname$/i, /^surname$/i, /^family_?name$/i],
      keywords: ['last', 'surname', 'family'],
      labels: ['last name', 'surname', 'family name', 'last', 'lname'],
      autocomplete: ['family-name'],
      priority: 10
    },
    fullName: {
      patterns: [/^full_?name$/i, /^name$/i, /^applicant_?name$/i],
      keywords: ['full'],
      labels: ['full name', 'name', 'your name', 'applicant name'],
      autocomplete: ['name'],
      priority: 8
    },
    email: {
      patterns: [/^email$/i, /^e_?mail$/i, /^contact_?email$/i, /^email_?address$/i],
      keywords: ['email', 'mail'],
      labels: ['email', 'e-mail', 'email address', 'contact email', 'your email', 'work email'],
      autocomplete: ['email'],
      types: ['email'],
      priority: 15
    },
    phone: {
      patterns: [/^phone$/i, /^tel$/i, /^mobile$/i, /^cell$/i, /^mobile_?number$/i, /^phone_?number$/i],
      keywords: ['phone', 'tel', 'mobile', 'cell', 'number'],
      labels: ['phone', 'telephone', 'mobile', 'cell phone', 'mobile number', 'best phone number', 'phone number', 'contact number'],
      autocomplete: ['tel'],
      types: ['tel'],
      priority: 12
    },
    address: {
      patterns: [/^address$/i, /^street$/i, /^street_?address$/i],
      keywords: ['address', 'street'],
      labels: ['address', 'street address', 'home address'],
      autocomplete: ['street-address', 'address-line1'],
      priority: 8
    },
    city: {
      patterns: [/^city$/i, /^town$/i, /^locality$/i],
      keywords: ['city', 'town'],
      labels: ['city', 'town'],
      autocomplete: ['locality'],
      priority: 8
    },
    state: {
      patterns: [/^state$/i, /^province$/i, /^region$/i],
      keywords: ['state', 'province'],
      labels: ['state', 'province', 'select state'],
      autocomplete: ['region'],
      priority: 8
    },
    zipCode: {
      patterns: [/^zip_?code$/i, /^postal_?code$/i, /^zip$/i, /^postal$/i],
      keywords: ['zip', 'postal'],
      labels: ['zip code', 'postal code', 'zip'],
      autocomplete: ['postal-code'],
      priority: 8
    },
    country: {
      patterns: [/^country$/i, /^nation$/i],
      keywords: ['country'],
      labels: ['country'],
      autocomplete: ['country'],
      priority: 8
    },
    linkedIn: {
      patterns: [/^linked_?in$/i, /^linkedin_?(profile|url)?$/i],
      keywords: ['linkedin'],
      labels: ['linkedin', 'linkedin profile', 'linkedin url', 'linkedin profile url'],
      priority: 7
    },
    website: {
      patterns: [/^website$/i, /^portfolio$/i, /^personal_?site$/i, /^homepage$/i],
      keywords: ['website', 'portfolio', 'homepage'],
      labels: ['website', 'portfolio', 'personal website', 'portfolio website'],
      autocomplete: ['url'],
      types: ['url'],
      priority: 7
    },
    github: {
      patterns: [/^github$/i, /^git_?hub$/i, /^github_?(profile|url)?$/i],
      keywords: ['github'],
      labels: ['github', 'github profile'],
      priority: 7
    },
    currentTitle: {
      patterns: [/^current_?title$/i, /^job_?title$/i, /^position$/i, /^role$/i, /^title$/i],
      keywords: ['title', 'position', 'role', 'job'],
      labels: ['job title', 'current title', 'position', 'role', 'desired position'],
      autocomplete: ['organization-title'],
      priority: 6
    },
    company: {
      patterns: [/^company$/i, /^employer$/i, /^current_?company$/i, /^organization$/i],
      keywords: ['company', 'employer'],
      labels: ['company', 'current company', 'employer'],
      autocomplete: ['organization'],
      priority: 6
    },
    experience: {
      patterns: [/^experience$/i, /^years_?experience$/i, /^work_?experience$/i],
      keywords: ['experience', 'years'],
      labels: ['experience', 'years of experience', 'work experience'],
      priority: 5
    },
    salary: {
      patterns: [/^salary$/i, /^compensation$/i, /^expected_?salary$/i, /^desired_?salary$/i],
      keywords: ['salary', 'compensation', 'pay'],
      labels: ['salary', 'expected salary', 'desired salary'],
      priority: 5
    },
    workAuthorization: {
      patterns: [/^work_?authorization$/i, /^visa$/i, /^work_?permit$/i, /^authorization$/i],
      keywords: ['authorization', 'visa', 'permit'],
      labels: ['work authorization', 'visa status', 'work permit'],
      priority: 6
    }
  };

  detectFieldType(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): { type: string; confidence: number; method: string } | null {
    const elementInfo = this.getElementInfo(element);
    
    // Skip fields that are questions requiring thoughtful responses
    if (this.isQuestionField(elementInfo)) {
      console.log(`Skipping question field: ${elementInfo.id || elementInfo.name}`);
      return null;
    }

    const scores: Record<string, { score: number; method: string }> = {};
    
    for (const [fieldType, config] of Object.entries(this.fieldTypes)) {
      let score = 0;
      let method = '';

      // 1. Autocomplete attribute (highest confidence)
      if (config.autocomplete && elementInfo.autocomplete) {
        for (const auto of config.autocomplete) {
          if (elementInfo.autocomplete === auto) {
            score += config.priority * 2;
            method = 'autocomplete';
            break;
          }
        }
      }

      // 2. Input type attribute
      if (config.types && elementInfo.type) {
        for (const type of config.types) {
          if (elementInfo.type === type) {
            score += config.priority * 1.8;
            method = method || 'type';
            break;
          }
        }
      }

      // 3. Exact pattern matching on ID/name
      if (config.patterns) {
        for (const pattern of config.patterns) {
          if (pattern.test(elementInfo.id) || pattern.test(elementInfo.name)) {
            score += config.priority * 1.5;
            method = method || 'pattern';
            break;
          }
        }
      }

      // 4. Label text matching
      if (config.labels && elementInfo.labelText) {
        const labelTextLower = elementInfo.labelText.toLowerCase().trim();
        for (const label of config.labels) {
          const labelLower = label.toLowerCase();
          // Exact match gets full score
          if (labelTextLower === labelLower) {
            score += config.priority * 1.5;
            method = method || 'label';
            break;
          }
          // Partial match gets reduced score
          else if (labelTextLower.includes(labelLower)) {
            score += config.priority * 1.2;
            method = method || 'label';
            break;
          }
          // Word boundary matching for better accuracy
          else if (new RegExp(`\\b${labelLower.replace(/\s+/g, '\\s+')}\\b`).test(labelTextLower)) {
            score += config.priority * 1.3;
            method = method || 'label';
            break;
          }
        }
      }

      // 5. Keyword matching in attributes
      if (config.keywords) {
        for (const keyword of config.keywords) {
          if (elementInfo.attributes.includes(keyword)) {
            score += config.priority * 0.8;
            method = method || 'keyword';
            break;
          }
        }
      }

      // 6. Placeholder text matching
      if (config.labels && elementInfo.placeholder) {
        for (const label of config.labels) {
          if (elementInfo.placeholder.toLowerCase().includes(label)) {
            score += config.priority * 0.6;
            method = method || 'placeholder';
            break;
          }
        }
      }

      if (score > 0) {
        scores[fieldType] = { score, method };
      }
    }

    // Find the highest scoring field type
    let bestMatch: { type: string; confidence: number; method: string } | null = null;
    let maxPossibleScore = 0;
    
    // Calculate maximum possible score for normalization
    for (const [fieldType, config] of Object.entries(this.fieldTypes)) {
      const maxScore = config.priority * 2; // Autocomplete gives highest multiplier
      if (maxScore > maxPossibleScore) {
        maxPossibleScore = maxScore;
      }
    }
    
    for (const [fieldType, result] of Object.entries(scores)) {
      if (!bestMatch || result.score > bestMatch.confidence) {
        bestMatch = {
          type: fieldType,
          confidence: result.score,
          method: result.method
        };
      }
    }
    
    // Normalize the best match confidence to 0-100%
    if (bestMatch) {
      bestMatch.confidence = Math.min(100, Math.round((bestMatch.confidence / maxPossibleScore) * 100));
    }

    // Only return if confidence is above threshold (now using normalized percentage)
    return bestMatch && bestMatch.confidence >= 25 ? bestMatch : null;
  }

  private isQuestionField(elementInfo: any): boolean {
    // Priority check: Labels are more reliable than placeholders for question detection
    const labelText = elementInfo.labelText.toLowerCase();
    const idName = `${elementInfo.id} ${elementInfo.name}`.toLowerCase();
    
    // Check for question marks in labels and field names (most reliable)
    if (labelText.includes('?') || idName.includes('?')) {
      return true;
    }

    // Specific question patterns in labels (high confidence)
    const questionPatterns = [
      /why\s+are\s+you\s+interested/i,
      /why\s+do\s+you\s+want/i,
      /what\s+motivates\s+you/i,
      /describe\s+yourself/i,
      /tell\s+us\s+about\s+yourself/i,
      /what\s+makes\s+you\s+(unique|special)/i,
      /how\s+would\s+you\s+handle/i,
      /explain\s+why/i,
      /why\s+should\s+we\s+hire/i,
      /what\s+are\s+your\s+(strengths|weaknesses|goals)/i
    ];

    // Check question patterns in labels only (more reliable than placeholders)
    for (const pattern of questionPatterns) {
      if (pattern.test(labelText)) {
        return true;
      }
    }

    // Essay/long-form content fields
    const essayPatterns = [
      /cover\s+letter/i,
      /personal\s+statement/i,
      /motivation\s+letter/i,
      /essay/i,
      /additional\s+information/i,
      /comments/i,
      /notes/i,
      /message/i
    ];

    const allText = `${labelText} ${idName}`;
    for (const pattern of essayPatterns) {
      if (pattern.test(allText)) {
        return true;
      }
    }

    // Check for textarea elements with question-like labels only
    if (elementInfo.tagName === 'textarea') {
      // Only flag textareas if the label clearly indicates it's a question
      if (labelText.match(/(why|describe|tell\s+us|explain|what\s+makes)/i) && 
          labelText.length > 10) { // Avoid short labels like "What" that might be dropdown labels
        return true;
      }
    }

    return false;
  }

  private getElementInfo(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
    // Enhanced label detection - find labels through multiple methods
    let labelText = '';
    
    // Method 1: Direct label[for] association
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) labelText = label.textContent || '';
    }
    
    // Method 2: Parent label element
    if (!labelText) {
      const parentLabel = element.closest('label');
      if (parentLabel) labelText = parentLabel.textContent || '';
    }
    
    // Method 3: Preceding sibling label
    if (!labelText) {
      let sibling = element.previousElementSibling;
      while (sibling && !labelText) {
        if (sibling.tagName.toLowerCase() === 'label') {
          labelText = sibling.textContent || '';
          break;
        }
        sibling = sibling.previousElementSibling;
      }
    }
    
    // Method 4: Look for text in parent containers (common in form builders)
    if (!labelText) {
      const parent = element.closest('div, fieldset, .form-group, .field, [class*="field"], [class*="form"]');
      if (parent) {
        // Find all text nodes and labels within the container
        const textElements = parent.querySelectorAll('label, span, div, p');
        for (let i = 0; i < textElements.length; i++) {
          const textEl = textElements[i];
          const text = textEl.textContent?.trim();
          if (text && text.length > 2 && text.length < 100 && !text.includes('*')) {
            // Avoid picking up help text or long descriptions
            const words = text.split(/\s+/);
            if (words.length <= 6) {
              labelText = text;
              break;
            }
          }
        }
      }
    }
    
    // Method 5: Check aria-label and aria-labelledby
    if (!labelText) {
      labelText = element.getAttribute('aria-label') || '';
      if (!labelText && element.getAttribute('aria-labelledby')) {
        const labelledBy = document.getElementById(element.getAttribute('aria-labelledby')!);
        if (labelledBy) labelText = labelledBy.textContent || '';
      }
    }

    return {
      id: element.id || '',
      name: element.name || '',
      type: element.getAttribute('type') || '',
      autocomplete: element.getAttribute('autocomplete') || '',
      placeholder: (element as HTMLInputElement).placeholder || '',
      className: element.className || '',
      labelText: labelText.trim(),
      tagName: element.tagName.toLowerCase(),
      attributes: [
        element.id,
        element.name,
        element.className,
        element.getAttribute('data-field') || '',
        element.getAttribute('data-testid') || '',
        labelText
      ].join(' ').toLowerCase()
    };
  }
}

export class AutoFillEngine {
  private userProfile: UserProfile;
  private detector: FieldDetector;
  private detectedFields: Map<string, string> = new Map();
  private elementMap: Map<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = new Map();

  constructor(userProfile: UserProfile) {
    this.userProfile = userProfile;
    this.detector = new FieldDetector();
  }

  public async autoFillPage(): Promise<{ filled: number; detected: number; fields: string[]; analysis: Array<{fieldType: string; confidence: number; method: string; selector: string}> }> {
    this.detectedFields.clear();
    this.elementMap.clear();
    const analysisData: Array<{fieldType: string; confidence: number; method: string; selector: string}> = [];

    // Find all form elements
    const elements = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
    
    elements.forEach((element) => {
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        const result = this.detector.detectFieldType(element);
        
        if (result) {
          const selector = this.getElementSelector(element);
          
          this.detectedFields.set(selector, result.type);
          this.elementMap.set(selector, element);
          
          // Add to analysis data for UI display
          analysisData.push({
            fieldType: result.type,
            confidence: Math.round(result.confidence),
            method: result.method,
            selector: selector
          });
        }
      }
    });
    
    try {
      // Fill detected fields
      const filledFields = this.fillDetectedFields();
      return {
        filled: filledFields.length,
        detected: this.detectedFields.size,
        fields: filledFields,
        analysis: analysisData
      };
    } catch (error) {
      return {
        filled: 0,
        detected: this.detectedFields.size,
        fields: [],
        analysis: analysisData
      };
    }
  }

  private fillDetectedFields(): string[] {
    const filledFields: string[] = [];
    
    const fieldValueMap: Record<string, string> = {
      firstName: this.userProfile.personalInfo.firstName,
      lastName: this.userProfile.personalInfo.lastName,
      fullName: this.userProfile.personalInfo.fullName,
      email: this.userProfile.personalInfo.email,
      phone: this.userProfile.personalInfo.phone,
      address: this.userProfile.personalInfo.address,
      city: this.userProfile.personalInfo.city,
      state: this.userProfile.personalInfo.state,
      zipCode: this.userProfile.personalInfo.zipCode,
      country: this.userProfile.personalInfo.country,
      linkedIn: this.userProfile.personalInfo.linkedIn,
      website: this.userProfile.personalInfo.website,
      github: this.userProfile.personalInfo.github,
      currentTitle: this.userProfile.professional.currentTitle,
      company: this.userProfile.professional.company,
      experience: this.userProfile.professional.experience,
      salary: this.userProfile.professional.salary,
      workAuthorization: this.userProfile.professional.workAuthorization,
    };

    this.detectedFields.forEach((fieldType, selector) => {
      const element = this.elementMap.get(selector);
      const value = fieldValueMap[fieldType];
      
      if (element && value) {
        const success = this.fillField(element, value);
        if (success) {
          filledFields.push(fieldType);
        }
      }
    });
    
    return filledFields;
  }

  private fillField(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): boolean {
    try {
      let success = false;
      
      // Check if element is read-only or disabled
      if (element.hasAttribute('readonly') || element.hasAttribute('disabled')) {
        return false;
      }
      
      if (element instanceof HTMLSelectElement) {
        success = this.fillSelectField(element, value);
      } else {
        // Store the current value to check if filling succeeded
        const originalValue = element.value;
        
        // Try multiple approaches to set the value
        try {
          // Method 1: Direct property access
          element.value = value;
          
          // Method 2: Force update through property descriptor
          if (element.value !== value) {
            const descriptor = Object.getOwnPropertyDescriptor(element, 'value') || 
                              Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value');
            
            if (descriptor && descriptor.set) {
              descriptor.set.call(element, value);
            }
          }
          
          // Method 3: setAttribute for controlled inputs
          if (element.value !== value) {
            element.setAttribute('value', value);
          }
          
          // Trigger events to notify React/frameworks
          this.triggerEvents(element);
          
          // Verify the value was actually set
          success = element.value === value;
          
        } catch (error) {
          success = false;
        }
      }
      
      if (success) {
        this.addFilledFieldIndicator(element);
      }
      
      return success;
    } catch (error) {
      return false;
    }
  }

  private addFilledFieldIndicator(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): void {
    // Add subtle visual indicator that field was auto-filled
    element.style.borderColor = '#10b981';
    element.style.boxShadow = '0 0 0 1px #10b981';
    element.style.backgroundColor = '#f0fdf4';
    element.setAttribute('data-autofilled', 'true');
    
    // Add a subtle animation
    element.style.transition = 'all 0.3s ease';
    
    // Remove the indicator after 3 seconds
    setTimeout(() => {
      if (element.getAttribute('data-autofilled') === 'true') {
        element.style.boxShadow = '';
        element.style.borderColor = '';
        element.style.backgroundColor = '';
        element.style.transition = '';
        element.removeAttribute('data-autofilled');
      }
    }, 3000);
  }

  private fillSelectField(select: HTMLSelectElement, value: string): boolean {
    const options = Array.from(select.options);
    
    // Try exact match first
    let option = options.find(opt => 
      opt.value.toLowerCase() === value.toLowerCase() ||
      opt.text.toLowerCase() === value.toLowerCase()
    );
    
    // Try partial match
    if (!option) {
      option = options.find(opt => 
        opt.text.toLowerCase().includes(value.toLowerCase()) ||
        opt.value.toLowerCase().includes(value.toLowerCase())
      );
    }

    // Special state mappings
    if (!option && value.toLowerCase() === 'ca') {
      option = options.find(opt => 
        opt.text.toLowerCase().includes('california') ||
        opt.value.toLowerCase().includes('california')
      );
    }

    // Experience level mappings
    if (!option && value.includes('5+')) {
      option = options.find(opt => 
        opt.text.includes('5+') || opt.text.includes('5-') || opt.text.includes('senior')
      );
    }

    // Work authorization mappings
    if (!option && value.toLowerCase().includes('citizen')) {
      option = options.find(opt => 
        opt.text.toLowerCase().includes('citizen') ||
        opt.text.toLowerCase().includes('authorized') ||
        opt.text.toLowerCase().includes('yes')
      );
    }

    if (option) {
      select.value = option.value;
      this.triggerEvents(select);
      return true;
    }

    return false;
  }

  private triggerEvents(element: HTMLElement): void {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  public getDetectedFields(): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    this.detectedFields.forEach((fieldType, selector) => {
      result[selector] = fieldType;
    });
    return result;
  }

  private getElementSelector(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
    if (element.id) return `#${element.id}`;
    if (element.name) return `[name="${element.name}"]`;
    
    const tag = element.tagName.toLowerCase();
    const classes = Array.from(element.classList).slice(0, 2).join('.');
    return classes ? `${tag}.${classes}` : tag;
  }
}

// Create auto-fill engine with default profile
export function createAutoFillEngine(): AutoFillEngine {
  return new AutoFillEngine(defaultUserProfile);
}