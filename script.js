const fs = require('fs');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = dir + '/' + file;
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if(dirFile.endsWith('.tsx')) filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync('./src/components');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  if (file.includes('Modal') || file.includes('Btn') || file.includes('UX')) {
      content = content.replace(/text-xs font-bold text-slate-500 uppercase/g, 'text-sm font-semibold text-slate-700 ml-1');
      content = content.replace(/w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:border-violet-500/g, 'w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-violet-600 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]');
      content = content.replace(/w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-black focus:outline-none focus:border-violet-500/g, 'w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-violet-600 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]');
      
      content = content.replace(/Global Corporate Directory/g, 'Gestión de Personal');
      content = content.replace(/Adscripción Dinámica \(Sucursal Obligatoria\)/g, 'Asignar Sucursal');
      content = content.replace(/Procesando DB\.\.\./g, 'Guardando...');
  }
  
  if (original !== content) {
     fs.writeFileSync(file, content);
     console.log('Fixed: ' + file);
  }
});
