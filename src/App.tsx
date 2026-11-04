// ==============================================================================
// Cấu trúc Cây Thành phần Gốc (Root App Component)
// Hệ thống: ThuTra TNCN - Tầng 4: Wire-up UI with Context & API Services
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaxFilingProvider } from './contexts/TaxFilingContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { storageUtil } from './utils/storage.util';

// Phân hệ Xác thực
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Phân hệ Người nộp thuế & Quyết toán
import { DashboardPage } from './pages/DashboardPage';
import { WizardStep1Page } from './components/wizard-step1/WizardStep1Page';
import { WizardStep2Page } from './components/wizard/WizardStep2Page';
import { WizardStep3Page } from './components/wizard-step3/WizardStep3Page';
import { TaxChatPage } from './components/tax-chat/TaxChatPage';
import { TaxForecastPage } from './components/forecast/TaxForecastPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { SettlementHistoryPage } from './pages/SettlementHistoryPage';

// Phân hệ Quản trị & Vận hành Quy tắc
import { AdminPage } from './pages/AdminPage';

// Khung Giao diện dùng chung
import { Sidebar } from './components/dashboard/Sidebar';
import { Header } from './components/dashboard/Header';

export type ScreenType = 
  | 'login' | 'register' | 'dashboard' 
  | 'income' | 'dependents' | 'calculation' | 'export' | 'chat'
  | 'wizard_step1' | 'wizard_step2' | 'wizard_step3' 
  | 'forecast' | 'chatbot' | 'settings' | 'history'
  | 'admin';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Khởi tạo màn hình thông minh dựa trên trạng thái token trong LocalStorage
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    if (storageUtil.hasValidAuth()) {
      const cached = storageUtil.getUserProfile();
      if (cached?.role === 'admin_manager' || cached?.role === 'super_admin') {
        return 'admin';
      }
      return 'dashboard';
    }
    return 'login';
  });

  // Tự động chuyển hướng về màn hình đăng nhập nếu phiên hết hạn hoặc chưa đăng nhập
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (currentScreen !== 'register' && currentScreen !== 'login') {
        setCurrentScreen('login');
      }
    }
  }, [isLoading, isAuthenticated, currentScreen]);

  // 1. Nhóm Không có Sidebar (Auth Layout: Đăng nhập / Đăng ký)
  if (currentScreen === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(role) => {
          const userRole = role || user?.role || storageUtil.getUserProfile()?.role;
          if (userRole === 'admin_manager' || userRole === 'super_admin') {
            setCurrentScreen('admin');
          } else {
            setCurrentScreen('dashboard');
          }
        }}
        onNavigateToRegister={() => setCurrentScreen('register')}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterPage
        onNavigateToLogin={() => setCurrentScreen('login')}
        onRegisterSuccess={() => setCurrentScreen('dashboard')}
      />
    );
  }

  // 2. Nhóm Có Sidebar cố định (Main App Layout: 2 cột chuẩn)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Header cố định trên cùng */}
      <Header 
        currentScreen={currentScreen} 
        onNavigate={setCurrentScreen} 
        onLogout={async () => {
          await logout();
          setCurrentScreen('login');
        }}
      />

      {/* 2. Thân trang 2 cột */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 py-4 gap-6">
        {/* Cột 1: Sidebar bên trái cố định (w-64 flex-shrink-0) */}
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        </aside>

        {/* Cột 2: Nội dung chính linh hoạt theo từng màn hình được bảo vệ bởi ProtectedRoute */}
        <main className="flex-1 min-w-0">
          {currentScreen === 'dashboard' && (
            <ProtectedRoute
              allowedRoles={['user', 'super_admin']}
              onRedirectToLogin={() => setCurrentScreen('login')}
              onRedirectToHome={() => setCurrentScreen(user?.role === 'admin_manager' ? 'admin' : 'dashboard')}
            >
              <DashboardPage onNavigate={setCurrentScreen} />
            </ProtectedRoute>
          )}

          {(currentScreen === 'dependents' || currentScreen === 'wizard_step1') && (
            <ProtectedRoute
              allowedRoles={['user', 'super_admin']}
              onRedirectToLogin={() => setCurrentScreen('login')}
              onRedirectToHome={() => setCurrentScreen(user?.role === 'admin_manager' ? 'admin' : 'dashboard')}
            >
              <WizardStep1Page
                onProceedToStep2={() => setCurrentScreen('income')}
                onBackDashboard={() => setCurrentScreen('dashboard')}
                onStepClick={(step) => {
                  if (step === 2) setCurrentScreen('income');
                  if (step === 3) setCurrentScreen('export');
                }}
              />
            </ProtectedRoute>
          )}

          {(currentScreen === 'income' || currentScreen === 'wizard_step2') && (
            <ProtectedRoute
              allowedRoles={['user', 'super_admin']}
              onRedirectToLogin={() => setCurrentScreen('login')}
              onRedirectToHome={() => setCurrentScreen(user?.role === 'admin_manager' ? 'admin' : 'dashboard')}
            >
              <WizardStep2Page
                onBackToStep1={() => setCurrentScreen('dependents')}
                onProceedToStep3={() => setCurrentScreen('export')}
                onBackToDashboard={() => setCurrentScreen('dashboard')}
                onStepClick={(step) => {
                  if (step === 1) setCurrentScreen('dependents');
                  if (step === 3) setCurrentScreen('export');
                }}
              />
            </ProtectedRoute>
          )}

          {(currentScreen === 'export' || currentScreen === 'wizard_step3') && (
            <ProtectedRoute
              allowedRoles={['user', 'super_admin']}
              onRedirectToLogin={() => setCurrentScreen('login')}
              onRedirectToHome={() => setCurrentScreen(user?.role === 'admin_manager' ? 'admin' : 'dashboard')}
            >
              <WizardStep3Page
                onBackToStep2={() => setCurrentScreen('income')}
                onGoToStep1={() => setCurrentScreen('dependents')}
                onBackToDashboard={() => setCurrentScreen('dashboard')}
                onStepClick={(step) => {
                  if (step === 1) setCurrentScreen('dependents');
                  if (step === 2) setCurrentScreen('income');
                }}
              />
            </ProtectedRoute>
          )}

          {(currentScreen === 'calculation' || currentScreen === 'forecast') && (
            <ProtectedRoute
              allowedRoles={['user', 'super_admin']}
              onRedirectToLogin={() => setCurrentScreen('login')}
              onRedirectToHome={() => setCurrentScreen(user?.role === 'admin_manager' ? 'admin' : 'dashboard')}
            >
              <TaxForecastPage
                onNavigateToDashboard={() => setCurrentScreen('dashboard')}
                onNavigateToStep1={() => setCurrentScreen('dependents')}
                onNavigateToStep2={() => setCurrentScreen('income')}
                onNavigateToStep3={() => setCurrentScreen('export')}
                onNavigateToChatbot={() => setCurrentScreen('chat')}
              />
            </ProtectedRoute>
          )}

          {(currentScreen === 'chat' || currentScreen === 'chatbot') && (
            <ProtectedRoute
              allowedRoles={['user', 'super_admin']}
              onRedirectToLogin={() => setCurrentScreen('login')}
              onRedirectToHome={() => setCurrentScreen(user?.role === 'admin_manager' ? 'admin' : 'dashboard')}
            >
              <TaxChatPage
                onNavigateToOverview={() => setCurrentScreen('dashboard')}
                onNavigateToIncomes={() => setCurrentScreen('income')}
                onNavigateToSettlementStep3={() => setCurrentScreen('export')}
              />
            </ProtectedRoute>
          )}

          {currentScreen === 'settings' && (
            <ProtectedRoute
              allowedRoles={['user', 'super_admin']}
              onRedirectToLogin={() => setCurrentScreen('login')}
              onRedirectToHome={() => setCurrentScreen(user?.role === 'admin_manager' ? 'admin' : 'dashboard')}
            >
              <ProfileSettingsPage
                onNavigate={setCurrentScreen}
                onNavigateToDashboard={() => setCurrentScreen('dashboard')}
                onLogout={async () => {
                  await logout();
                  setCurrentScreen('login');
                }}
              />
            </ProtectedRoute>
          )}

          {currentScreen === 'history' && (
            <ProtectedRoute
              allowedRoles={['user', 'super_admin']}
              onRedirectToLogin={() => setCurrentScreen('login')}
              onRedirectToHome={() => setCurrentScreen(user?.role === 'admin_manager' ? 'admin' : 'dashboard')}
            >
              <SettlementHistoryPage
                onNavigate={setCurrentScreen}
                onNavigateToDashboard={() => setCurrentScreen('dashboard')}
                onNavigateToWizard2={() => setCurrentScreen('wizard_step2')}
              />
            </ProtectedRoute>
          )}

          {currentScreen === 'admin' && (
            <ProtectedRoute
              allowedRoles={['admin_manager', 'super_admin']}
              onRedirectToLogin={() => setCurrentScreen('login')}
              onRedirectToHome={() => setCurrentScreen('dashboard')}
            >
              <AdminPage onNavigate={setCurrentScreen} />
            </ProtectedRoute>
          )}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TaxFilingProvider>
        <AppContent />
      </TaxFilingProvider>
    </AuthProvider>
  );
};

export default App;
