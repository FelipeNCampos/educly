# Generate Certificate Function

Função serverless para geração automática de certificados de conclusão de cursos.

## 📋 Descrição

Esta função gera certificados personalizados em formato PNG baseados em um template predefinido. O certificado é gerado com os dados do aluno e do curso, salvos no Supabase Storage e registrados no banco de dados.

## 🎨 Template do Certificado

O certificado contém os seguintes elementos:

- **Cabeçalho**: "Certificado de Conclusão"
- **Nome do aluno**: Nome completo do estudante
- **Curso**: Especialização e área de formação
- **Nível**: Badge colorido indicando o nível (júnior, pleno, sênior)
- **Descrição**: Texto descritivo sobre a formação e carga horária
- **Localização**: Cidade onde o curso foi concluído
- **Data**: Data de conclusão do curso
- **Assinatura**: Informações do responsável/instrutor
- **Mascote**: Personagem Educly
- **Badge**: Selo IA indicando o tipo de certificação

## 📥 Entrada (Request Body)

```json
{
  "nome": "Matheus Felipe Sousa Santos",
  "formacao": "Inteligência Artificial",
  "nivel": "júnior",
  "horas": 40,
  "descricao": "opcional - descrição adicional",
  "cidade": "Granada",
  "data": "15/02/2026",
  "contribuicao": "opcional - texto de contribuição",
  "nomeResponsavel": "opcional - nome do instrutor"
}
```

## 📤 Saída (Response)

### Sucesso (200)
```json
{
  "success": true,
  "url": "https://seu-projeto.supabase.co/storage/v1/object/public/certificates/certificate_123_1234567890.png",
  "fileName": "certificate_123_1234567890.png"
}
```

### Erro (400)
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

## 🔧 Configuração

### 1. Criar bucket de storage

Crie um bucket chamado `certificates` no Supabase Storage:

```sql
-- Criar bucket público para certificados
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true);

-- Política para permitir upload autenticado
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificates');

-- Política para leitura pública
CREATE POLICY "Certificados são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'certificates');
```

### 2. Criar tabela de certificados

```sql
CREATE TABLE certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  course_name TEXT NOT NULL,
  completion_date TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para buscar certificados por usuário
CREATE INDEX idx_certificates_user_id ON certificates(user_id);

-- RLS Policies
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios certificados"
ON certificates FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir certificados"
ON certificates FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### 3. Deploy da função

```bash
# Deploy da função
supabase functions deploy generate-certificate

# Definir variáveis de ambiente (se necessário)
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_ANON_KEY=your_key
```

## 💻 Exemplo de Uso

### Frontend (React/TypeScript)

```typescript
import { supabase } from '@/lib/supabase';

async function generateCertificate(courseData) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-certificate', {
      body: {
        nome: 'Matheus Felipe Sousa Santos',
        formacao: 'Inteligência Artificial',
        nivel: 'júnior',
        horas: 40,
        cidade: 'Granada',
        data: '15/02/2026',
        contribuicao: 'Demonstrou excelência',
        nomeResponsavel: 'Prof. João Silva'
      }
    });

    if (error) throw error;

    console.log('Certificado gerado:', data.url);
    return data.url;
  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    throw error;
  }
}
```

### cURL

```bash
curl -X POST 'https://seu-projeto.supabase.co/functions/v1/generate-certificate' \
  -H 'Authorization: Bearer SEU_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "nome": "Matheus Felipe Sousa Santos",
    "formacao": "Inteligência Artificial",
    "nivel": "júnior",
    "horas": 40,
    "cidade": "Granada",
    "data": "15/02/2026"
  }'
```

## 🎨 Personalização

Para personalizar o template do certificado, edite o arquivo `certificate-template.ts`:

- **Layout**: Ajuste as posições dos elementos no canvas
- **Fontes**: Modifique tamanhos, famílias e cores das fontes
- **Cores**: Altere as cores do tema
- **Textos**: Personalize os textos fixos do certificado

## 📝 Notas

- A imagem de fundo deve estar em `public/FundoCertificadoModulo.png`
- O certificado é gerado em PNG com alta qualidade
- Cada certificado é único e nomeado com timestamp
- Os certificados são salvos de forma permanente no Storage
- É necessário autenticação para gerar certificados

## 🔒 Segurança

- ✅ Requer autenticação via Supabase Auth
- ✅ Validação de dados obrigatórios
- ✅ Row Level Security (RLS) habilitado
- ✅ Armazenamento seguro no Storage
- ✅ CORS configurado

## 🐛 Troubleshooting

**Erro: "Não autenticado"**
- Verifique se o token de autenticação está sendo enviado corretamente

**Erro: "Bucket não encontrado"**
- Certifique-se de criar o bucket `certificates` no Storage

**Erro: "Permissão negada"**
- Verifique as políticas RLS da tabela e do Storage

**Imagem de fundo não carrega**
- Verifique se o arquivo `FundoCertificadoModulo.png` existe em `public/`
- Ajuste a URL na função para apontar para o local correto
