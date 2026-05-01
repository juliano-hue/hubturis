const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

// Função para formatar tamanho do arquivo
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função principal
async function analisarPasta() {
  // CAMINHO ATUALIZADO - agora dentro da pasta public
  const pastaPath = 'E:\\turis-hub\\public\\Frank';
  
  if (!fs.existsSync(pastaPath)) {
    console.log(`❌ Pasta não encontrada: ${pastaPath}`);
    console.log('💡 Certifique-se que a pasta Frank está em: E:\\turis-hub\\public\\Frank');
    return;
  }
  
  console.log('📁 ANALISANDO PASTA: E:\\turis-hub\\public\\Frank\n');
  console.log('='.repeat(80));
  
  const arquivos = await readdir(pastaPath);
  
  // Filtrar apenas arquivos de mídia
  const extensoesMedia = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov', '.avi', '.svg'];
  
  const arquivosMedia = arquivos.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return extensoesMedia.includes(ext);
  });
  
  if (arquivosMedia.length === 0) {
    console.log('⚠️ Nenhum arquivo de imagem/vídeo encontrado na pasta.');
    console.log('Formatos aceitos: .jpg, .png, .gif, .webp, .mp4, .webm, .mov, .avi');
    return;
  }
  
  console.log(`\n📸 Encontrados ${arquivosMedia.length} arquivos de mídia:\n`);
  
  // Separar imagens e vídeos
  const imagens = [];
  const videos = [];
  
  for (const file of arquivosMedia) {
    const filePath = path.join(pastaPath, file);
    const stats = await stat(filePath);
    const ext = path.extname(file).toLowerCase();
    const nomeSemExt = path.basename(file, ext);
    
    // Determinar tipo
    let tipo = '';
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
      tipo = '🖼️ IMAGEM';
      imagens.push(file);
    } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
      tipo = '🎬 VÍDEO';
      videos.push(file);
    }
    
    console.log(`${tipo} | ${file}`);
    console.log(`   📁 Nome: ${nomeSemExt}`);
    console.log(`   📄 Extensão: ${ext}`);
    console.log(`   📏 Tamanho: ${formatFileSize(stats.size)}`);
    console.log(`   📅 Modificado: ${stats.mtime.toLocaleDateString('pt-BR')}`);
    console.log(`   🔗 Caminho: /Frank/${file}`);
    console.log('-'.repeat(80));
  }
  
  // Salvar relatório
  const relatorioPath = path.join(pastaPath, 'relatorio-arquivos.json');
  const relatorio = {
    dataAnalise: new Date().toISOString(),
    totalArquivos: arquivosMedia.length,
    imagens: imagens,
    videos: videos,
    listaCompleta: arquivosMedia.map(file => ({
      nome: file,
      extensao: path.extname(file),
      caminho: `/Frank/${file}`
    }))
  };
  
  fs.writeFileSync(relatorioPath, JSON.stringify(relatorio, null, 2));
  console.log(`\n✅ Relatório salvo em: ${relatorioPath}`);
  
  // Gerar código de exemplo para usar na página
  console.log('\n💡 EXEMPLO DE USO NO REACT/NEXT.JS:\n');
  console.log('// Para usar imagens aleatórias:');
  console.log(`const imagens = [${imagens.map(img => `'/Frank/${img}'`).join(', ')}];`);
  console.log('const imagemAleatoria = imagens[Math.floor(Math.random() * imagens.length)];');
}

analisarPasta().catch(console.error);