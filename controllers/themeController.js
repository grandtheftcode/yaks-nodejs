
// controllers/themeController.js
const path = require('path');
const fs = require('fs') // Dosya sistemi işlemleri için promise tabanlı fs
const AdmZip = require('adm-zip');

const Setting = require('../models/Setting');

// --- Multer Yapılandırması ---


const themeController = {

  listThemes: (req, res) => {
    res.render('admin/themes/add', { // Yeni view yolu: views/admin/categories/add.ejs
        title: 'Yeni Kategori Ekle',
        layout: '../views/layouts/admin-layout'
    });
},

async uploadThemeZip(req, res, next) {

            
        // Dosya yolunu al (public'e göreceli)
         const publicDir = '../themes/'+req.file.originalname.replace(".yakstil","")+"/";
         const file = path.join(__dirname, publicDir+ req.file.originalname.replace(".yakstil",".zip").replace(/\\/g, '/'));




            let zip; // AdmZip instance

                zip = new AdmZip(file);
                zip.extractAllTo(path.join(__dirname, publicDir), /*overwrite*/ true);
                function cb(){

                };
                fs.rm(file,cb)
                cb(null, file);
         // Sıralama için son sırayı bul (veya varsayılan 0 kalsın)
         // const lastSlide = await db('carousel_slides').orderBy('slide_order','desc').first();
         // const slide_order = lastSlide ? lastSlide.slide_order + 1 : 0;

        try {

            req.flash('success_msg', 'Theme slide added successfully.');
            res.redirect('/admin/themes');

        } catch (error) {
             console.error("Error adding theme:", error);
             // Yüklenen dosyayı sil (eğer DB'ye eklenemediyse)
             try {
                 fs.unlinkSync(req.file.path);
                 console.log(`Deleted uploaded file ${req.file.path} due to DB error.`);
             } catch (unlinkErr) {
                 console.error(`Error deleting uploaded file ${req.file.path}:`, unlinkErr);
             }
             req.flash('error_msg', 'Failed to add carousel slide.');
            
             // next(error); // Veya genel hata işleyiciye gönder
             
             
             res.redirect('/admin/themes');
 }
},
}

function parseThemeFile(themeName) {
    const filePath = path.join( './themes', themeName, 'index.yaksinfo');
    const result = {
        name: 'Default Theme Name',
        devName: 'Default Dev Name',
        css: '',
        js: '',
        slider: '',
        prodlst: '',
        bloglst: '',
        fullTemplate: '', // Will hold the EJS renderable content
        error: null
    };

    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Theme file not found: ${filePath}`);
        }

        let content = fs.readFileSync(filePath, 'utf-8');
        result.fullTemplate = content; // Start with the full content

        const extractPart = (startTag, endTag, content) => {
            const regex = new RegExp(`${startTag}([\\s\\S]*?)${endTag}`, 'i');
            const match = content.match(regex);
            if (match && match[1]) {
                return match[1].trim();
            }
            return null;
        };

        const removePart = (startTag, endTag, content) => {
            const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}\\s*`, 'gi'); // Include surrounding whitespace
             return content.replace(regex, '');
        };

        // Extract metadata first
                
        result.prodlst = extractPart('/&PROD-LIST-START&/', '/&PROD-LIST-END&/', content) || '';
        result.bloglst = extractPart('/&BLOG-LIST-START&/', '/&BLOG-LIST-END&/', content) || '';
        result.name = extractPart('/&NAME-START&', '/&NAME-END&/', content) || result.name;
        result.devName = extractPart('/&DEV-NAME-START&/', '/&DEV-NAME-END&/', content) || result.devName;
        result.css = extractPart('/&CSS-START&/', '/&CSS-END&/', content) || '';
        result.js = extractPart('/&JS-START&/', '/&JS-END&/', content) || '';
        result.slider = extractPart('/&SLIDER-START&/', '/&SLIDER-END&/', content) || '';

        // Remove the extracted blocks (and their tags) from the main template content
        // It's important to remove them in a way that doesn't leave the tags in the final template
        let templateContent = content;
        templateContent = removePart('/&NAME-START&/', '/&NAME-END&/', templateContent);
        templateContent = removePart('/&DEV-NAME-START&/', '/&DEV-NAME-END&/', templateContent); 
        templateContent = removePart('/&SLIDER-START&/', '/&SLIDER-END&/', templateContent);
        templateContent = removePart('/&CSS-START&/', '/&CSS-END&/', templateContent);
        templateContent = removePart('/&JS-START&/', '/&JS-END&/', templateContent);
       

        // Construct the final EJS template string, injecting CSS and JS blocks
        // where they were originally defined (or wrap the body)
         // Option: Create a simple layout structure if index.txt is just body fragments
        // result.fullTemplate = `
        //     <!DOCTYPE html>
        //     <html lang="tr">
        //     ${result.css}
        //     ${templateContent.trim()}
        //     ${result.js}
        //     </html>
        // `;
        // Option 2: Assume index.txt *contains* <html>, <head>, <body> and just inject the CSS/JS
        // This seems more likely given your example structure. The CSS block includes <head>
        // and the JS block includes </footer></body>
        let finalTemplate = content; // Start again with original content


        finalTemplate = finalTemplate.replace('/&NAME-START&/', '<!-- Theme Name Start -->'); // Replace tags with comments or remove
        finalTemplate = finalTemplate.replace('/&NAME-END&/', '<!-- Theme Name End -->');
        finalTemplate = finalTemplate.replace('/&DEV-NAME-START&/', '<!-- Dev Name Start -->');
        finalTemplate = finalTemplate.replace('/&DEV-NAME-END&/', '<!-- Dev Name End -->');        
        finalTemplate = finalTemplate.replace('/&SLIDER-START&/', '<!-- Slider Start -->');
        finalTemplate = finalTemplate.replace('/&SLIDER-END&/', '<!-- Slider End -->');
        finalTemplate = finalTemplate.replace('/&CSS-START&/', '<!-- CSS Start -->'); // Keep the <head> tag within CSS block
        finalTemplate = finalTemplate.replace('/&CSS-END&/', '<!-- CSS End -->');     // Keep the </head><body> structure
        finalTemplate = finalTemplate.replace('/&JS-START&/', '<!-- JS Start -->');   // Keep footer/body closing tags
        finalTemplate = finalTemplate.replace('/&JS-END&/', '<!-- JS End -->');

        result.fullTemplate = finalTemplate; // The whole file content, slightly cleaned

    } catch (err) {
        console.error("Error parsing theme file:", err);
        result.error = err.message;
    }

    return result;
}

  
  // --- Example Usage ---
  // Ensure source directory exists for the example to run
  async function setupAndRunCopy() {
      try {
          await fs.mkdir(sourceDir, { recursive: true });
          await fs.writeFile(path.join(sourceDir, 'file1.txt'), 'Hello');
          await fs.mkdir(path.join(sourceDir, 'subdir'));
          await fs.writeFile(path.join(sourceDir, 'subdir', 'file2.txt'), 'World');
          console.log('Source directory created for demo.');
  
          await fs.cpSync(sourceDir, destDir);
  
      } catch(setupErr) {
          console.error("Error setting up source directory:", setupErr);
      } finally {
          // Optional: Clean up source/dest after copy for testing
          // await fs.rm(sourceDir, { recursive: true, force: true });
          // await fs.rm(destDir, { recursive: true, force: true });
      }
  }

async function applyThemeFile(themeName) {

    const themeData = parseThemeFile(themeName);
    const footerPath = './public/footer.ejs'; // Path to the file
    const headerPath = './public/header.ejs'; // Path to the file
    const sliderPath = './public/slider.ejs'; // Path to the file
    const plPath = './public/prod-list.ejs'; // Path to the file
    const blPath = './public/blog-list.ejs'; // Path to the file

    const contentfToAppend = themeData.css; // Content to add (note the \n for a new line)
    if (fs.existsSync("./public/assets/"))
    {
    fs.rm('./public/assets/',{ recursive: true, force: true }, (err) => {
        if (err) {
          // Handle errors, e.g., directory not found (though 'force: true' suppresses ENOENT)
          console.error(`Error removing directory `, err);
          return;
        }
        console.log(`Directory removed successfully`);
      });
        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
        console.log("Tema Yükleniyor Lütfen Bekleyin");
        await sleep(5000);

    }
    try{
    fs.cpSync("./themes/"+themeName+"/assets/",'./public/assets/',{ recursive: true, force: true});
}
catch{

}
    // Asynchronous append
    fs.writeFile(headerPath, contentfToAppend, 'utf8', (err) => {
    if (err) {
        console.error('Error appending to file:', err);
        return;
    }
    console.log('Content appended successfully!');
    });

    console.log('Append operation initiated...'); // This logs before the append might finish

    const contenthToAppend = themeData.js; // Content to add (note the \n for a new line)

    // Asynchronous append
    fs.writeFile(footerPath, contenthToAppend, 'utf8', (err) => {
    if (err) {
        console.error('Error appending to file:', err);
        return;
    }
    console.log('Content appended successfully!');
    });

    console.log('Append operation initiated...'); // This logs before the append might finish

    const contenthToAppnd = themeData.slider; // Content to add (note the \n for a new line)

    // Asynchronous append
    fs.writeFile(sliderPath, contenthToAppnd, 'utf8', (err) => {
    if (err) {
        console.error('Error appending to file:', err);
        return;
    }
    console.log('Content appended successfully!');
    });

    console.log('Append operation initiated...'); // This logs before the append might finish

    const contenthToApnd = themeData.prodlst; // Content to add (note the \n for a new line)

    // Asynchronous append
    fs.writeFile(plPath, contenthToApnd, 'utf8', (err) => {
    if (err) {
        console.error('Error appending to file:', err);
        return;
    }
    console.log('Content appended successfully!');
    });

    console.log('Append operation initiated...'); // This logs before the append might finish

    const contenthToppnd = themeData.bloglst; // Content to add (note the \n for a new line)

    // Asynchronous append
    fs.writeFile(blPath, contenthToppnd, 'utf8', (err) => {
    if (err) {
        console.error('Error appending to file:', err);
        return;
    }
    console.log('Content appended successfully!');
    });

    console.log('Append operation initiated...'); // This logs before the append might finish
}

// Example usage (if in a separate file):
 module.exports = { parseThemeFile , applyThemeFile , themeController};