// ==============================================================================
// Định nghĩa Kiểu Dữ liệu Chatbot AI Hỏi đáp Pháp luật Thuế (Tax Chat Types)
// Hệ thống: ThuTra TNCN
// ==============================================================================

export interface ChatMessageItem {
  id?: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

export interface ChatRequestDto {
  question: string;
  history?: ChatMessageItem[];
  profileId?: string;
}

export interface LegalReferenceDto {
  code: string;
  title: string;
  category?: string;
  relevantArticle?: string;
}

export interface TaxActionSuggestionDto {
  actionType: 'NAVIGATE_WIZARD_STEP1' | 'NAVIGATE_WIZARD_STEP2' | 'NAVIGATE_WIZARD_STEP3' | 'ADD_DEPENDENT' | 'UPLOAD_DOC' | 'NONE';
  label: string;
  description: string;
}

export interface ChatResponseDto {
  id: string;
  sender: 'bot';
  timestamp: string;
  answer: string;
  confidenceScore: number;
  legalReferences: LegalReferenceDto[];
  keyTakeaways: string[];
  suggestedAction?: TaxActionSuggestionDto;
  suggestedFollowUpQuestions: string[];
}

export interface ChatTopicSuggestionDto {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'deduction' | 'income' | 'audit' | 'deadline' | 'freelance';
}
