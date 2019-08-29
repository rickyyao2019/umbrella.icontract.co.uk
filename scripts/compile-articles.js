#!/usr/bin/env node
const BASE_PATH = 'contractor-resources/';
process.chdir(BASE_PATH);
var fs       = require('fs'),
    marked   = require('marked').setOptions({smartypants: true}),
    mtoc     = require('markdown-toc'),
    fm       = require('front-matter'),
    files    = process.argv.splice(2),
    template = fs.readFileSync('article/index.html').toString(),
    indexPagePath = 'articles.html',
    indexItems = [],
    slugRenderer;

function generateToC(content, fileName) {
  var toc = mtoc(content, { firsth1: false, maxdepth: 3 }).content;
  toc = toc.replace(/#/g, '/' + BASE_PATH + fileName + '#');
  return marked(toc);
}

function prepareSlugRenderer() {
  slugRenderer = new marked.Renderer();
  slugRenderer.heading = function (text, level) {
    const id = mtoc.slugify(text);
    return `<h${level} id=${id}>${text}</h${level}>`;
  };
  slugRenderer.image = function (href, title, text) {
    return `<img src="${href}" alt="${title}" title="${title}">`;
  };

}

function buildIndexItem(item) {
  return '' +
`  <article>
    <a href='/${BASE_PATH}${item.href}'>
      <figure>
        <img src='${item.cover}' alt='${item.title}' title='${item.title}'>
      </figure>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </a>
  </article>`;
}

function buildIndexItemPdfOnly() {
  return `
    <article>
      <a href='/${BASE_PATH}pdf/10-using-icontract.pdf'>
        <figure>
          <img src='/${BASE_PATH}img/10-using-icontract.jpg' alt='Using iContract' title='Using iContract'>
        </figure>
        <h3>Using iContract</h3>
        <p>This guidebook provides information on using iContract as a contractor or freelancer.</p>
      </a>
    </article>
    <article>
      <a href='/${BASE_PATH}pdf/11-consultancy-program.pdf'>
        <figure>
          <img src='/${BASE_PATH}img/11-consultancy-program.jpg' alt='Consultancy Program' title='Consultancy Program'>
        </figure>
        <h3>Consultancy Program</h3>
        <p>This guidebook provides information about the iContract Consultancy Programme.</p>
      </a>
    </article>
  `;
}

function generateIndexPage(items) {
  // this is necessary because Zanona is an absolute train wreck of a developer :'(
  items.push(buildIndexItemPdfOnly());

  var t =''
   + '<link rel=stylesheet href=/' + BASE_PATH + 'index.less>\n'
   + '<div class=\'articles section\'>\n'
   + items.join('\n') + '\n'
   + '</div>';
  fs.writeFileSync(indexPagePath, t, 'utf8');
}

prepareSlugRenderer();

files.forEach(function (file) {
  file = file.replace(BASE_PATH, '');
  var content = fs.readFileSync(file).toString(),
      parsed = fm(content),
      opts = parsed.attributes,
      fileName = opts.slug + '.html',
      toc = generateToC(parsed.body, fileName);

  // show only one of the insurance guides
  if (fileName === 'contractor-insurance.html') return;
  // if (fileName === 'contractor-insurance-alt.html') return;

  opts.href = fileName;
  content = marked(parsed.body, {renderer: slugRenderer});

  content = content.replace(/<h1 [\s\S]+?>([\s\S]+?)<\/h1>/, (_, title) =>{
    opts.title = title;
    return '';
  });

  indexItems.push(buildIndexItem(opts));

  content = template
    .replace('{{keywords}}', opts.keywords || '')
    .replace('{{pageTitle}}', opts.pageTitle)
    .replace('{{metaDescription}}', opts.metaDescription)
    .replace(/\{\{title\}\}/g, opts.title)
    .replace('{{pdf}}',      opts.pdf)
    .replace('{{toc}}',      toc)
    .replace('{{content}}',  content);
  fs.writeFileSync(opts.href, content, 'utf8');
});

generateIndexPage(indexItems);
