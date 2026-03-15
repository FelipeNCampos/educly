import { useTranslation } from 'react-i18next';

export const TestI18n = () => {
  const { t, i18n } = useTranslation();
  
  console.log('=== DEBUG i18n ===');
  console.log('Idioma atual:', i18n.language);
  console.log('Tradução globalReach.title existe?', i18n.exists('globalReach.title'));
  console.log('Valor da tradução:', t('globalReach.title'));
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-2">🔍 Teste de Tradução</h3>
      
      <div className="space-y-2">
        <p><strong>Idioma atual:</strong> {i18n.language}</p>
        <p><strong>globalReach.title:</strong> {t('globalReach.title')}</p>
        <p><strong>globalReach.subtitle:</strong> {t('globalReach.subtitle')}</p>
        <p><strong>globalReach.description:</strong> {t('globalReach.description')}</p>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => i18n.changeLanguage('en')}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          English
        </button>
        <button 
          onClick={() => i18n.changeLanguage('pt')}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Português
        </button>
        <button 
          onClick={() => i18n.changeLanguage('es')}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Español
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Verifique o console do navegador (F12) para ver os logs de debug.</p>
      </div>
    </div>
  );
};