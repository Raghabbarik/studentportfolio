const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');

async function test() {
  try {
    const res = await postcss([tailwind()]).process('@import "tailwindcss";\n.test { color: red; }', { from: 'test.css' });
    console.log('Success! Output length:', res.css.length);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();

