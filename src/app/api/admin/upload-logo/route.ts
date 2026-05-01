import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Verificar se é GIF
    if (!file.type.includes('gif')) {
      return NextResponse.json({ error: 'Apenas arquivos GIF são permitidos' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public');

    // Remover logo antigo se existir
    const files = await readdir(uploadDir);
    for (const oldFile of files) {
      if (oldFile.match(/^logo\.(gif|png|jpg|jpeg|svg)$/i)) {
        await unlink(path.join(uploadDir, oldFile));
      }
    }

    // Salvar novo logo
    const filename = 'logo.gif';
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const logoUrl = `/logo.gif`;

    // Salvar no arquivo .env.local
    // Nota: Isso é temporário. Em produção, salvaria no banco de dados

    return NextResponse.json({ success: true, url: logoUrl });
  } catch (error) {
    console.error('Erro no upload da logo:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
}

export async function GET() {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(process.cwd(), 'public', 'logo.gif');
  const exists = fs.existsSync(filePath);
  
  return NextResponse.json({ hasLogo: exists, url: exists ? '/logo.gif' : null });
}