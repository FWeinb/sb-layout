
// Using https://github.com/developit/htm
function h(n){const t=(n,e,s,r)=>{let u;e[0]=0;for(let h=1;h<e.length;h++){const l=e[h++],p=e[h]?(e[0]|=l?1:2,s[e[h++]]):e[++h];3===l?r[0]=p:4===l?r[1]=Object.assign(r[1]||{},p):5===l?(r[1]=r[1]||{})[e[++h]]=p:6===l?r[1][e[++h]]+=p+"":l?(u=n.apply(p,t(n,p,s,["",null])),r.push(u),p[0]?e[0]|=2:(e[h-2]=0,e[h]=u)):r.push(p)}return r};return t(function(n,t,...e){return t=t||{},e=e||[],"function"==typeof n?(e=e.reverse(),n({...t,children:e})):{type:n,attrs:t,children:e}},function(n){let t,e,s=1,r="",u="",h=[0];const l=n=>{1===s&&(n||(r=r.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?h.push(0,n,r):3===s&&(n||r)?(h.push(3,n,r),s=2):2===s&&"..."===r&&n?h.push(4,n,0):2===s&&r&&!n?h.push(5,0,!0,r):s>=5&&((r||!n&&5===s)&&(h.push(s,0,r,e),s=6),n&&(h.push(s,n,0,e),s=6)),r=""};for(let p=0;p<n.length;p++){p&&(1===s&&l(),l(p));for(let c=0;c<n[p].length;c++)t=n[p][c],1===s?"<"===t?(l(),h=[h],s=3):r+=t:4===s?"--"===r&&">"===t?(s=1,r=""):r=t+r[0]:u?t===u?u="":r+=t:'"'===t||"'"===t?u=t:">"===t?(l(),s=1):s&&("="===t?(s=5,e=r,r=""):"/"===t&&(s<5||">"===n[p][c+1])?(l(),3===s&&(h=h[0]),s=h,(h=h[0]).push(2,0,s),s=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(l(),s=2):r+=t),3===s&&"!--"===r&&(s=4,h=h[0])}return l(),h}(n),arguments,[])}

function render(...args) {
  const NativeElements = {
    ListWidget(ast) {
      return applyAttrs(new ListWidget(), ast.attrs);
    },
    Text(ast, parent) {
      const { attrs, children } = ast;
      parent = parent.addText(children.join(''));
      return applyAttrs(parent, attrs, {
        color: 'textColor',
        opacity: 'textOpacity',
        center: 'centerAlignText',
        left: 'leftAlignText',
        right: 'rightAlignText',
      });
    },
    Stack(ast, parent) {
      parent = parent.addStack();
      return applyAttrs(parent, ast.attrs, {
        vertical: 'layoutVertically',
        horizontal: 'layoutHorizontally',
      });
    },
    VStack(ast, parent) {
      parent = this.Stack(ast, parent);
      parent.layoutVertically();
      return parent;
    },
    HStack(ast, parent) {
      parent = this.Stack(ast, parent);
      parent.layoutHorizontally();
      return parent;
    },
    Spacer(ast, parent) {
      const { length, ...attrs } = ast.attrs;
      parent = parent.addSpacer(ensureBase10Int(length));
      return applyAttrs(parent, attrs);
    },
    Image(ast, parent) {
      const { image, ...attrs } = ast.attrs;
      parent = parent.addImage(image);
      return applyAttrs(parent, attrs, {
        size: 'imageSize',
        opacity: 'imageOpacity',
        fill: 'applyFillingContentMode',
        fitting: 'applyFittingContentMode',
        center: 'centerAlignImage',
        left: 'leftAlignImage',
        right: 'rightAlignImage',
      });
    },
    Symbol(ast, parent) {
      let { name, color, size, ...attrs } = ast.attrs;
      const sfSymbol = SFSymbol.named(name);
      // Look for a style in the props and call the apply*Weight() function 
      ["bold", "black", "heavy", "light", "medium", "regular", "semibold", "thin", "ultralight"].forEach((attr) => {
        if (attrs[attr]) {
          sfSymbol['apply' + capitalize(attr) + 'Weight']();
        }
      });
      if (size) {
        size = ensureBase10Int(size);
        if (typeof size !== "Size")  {
          size = new Size(size, size);
        } 
      }

      return this.Image({
          ...ast,
          attrs: {
            image: sfSymbol.image, 
            size: size || sfSymbol.image.size, 
            tintColor: color, 
            ...attrs
          }
        },
        parent
      )
    },
    Date(ast, parent) {
      const { date, ...attrs } = ast.attrs;
      parent = parent.addDate(date);
      return applyAttrs(parent, attrs, {
        dateStyle: 'applyDateStyle',
        offsetStyle: 'applyOffsetStyle',
        timerStyle: 'applyTimerStyle',
        center: 'centerAlignText',
        left: 'leftAlignText',
        right: 'rightAlignText',
      });
    },
  };

  // Call styles:
  //   render(h``)
  //   render(() => h``)

  let ast = args[0]; // render(h``)
  if (args.length >= 2 && Array.isArray(args[0])) { // render``
    ast = h(...args);
  } else if (args.length === 1) {
    if (typeof args[0] === 'function') { // render(() => h``)
      ast = args[0]();
    }
  }

  console.log(ast.toString());

  if (ast[0].type !== 'ListWidget')
    throw new Error(`A widget must be rendered inside <ListWidget>`);

  return renderWidget(ast[0], null);

  function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

  function ensureBase10Int(stringOrNumber) {
    if (typeof stringOrNumber === 'string') {
      return parseInt(stringOrNumber, 10);
    } 
    return stringOrNumber;
  }

  function call(element, name, values) {
    if (Array.isArray(values)) {
      element[name](...values);
    } else {
      element[name](values);
    }
  }
  function applyAttrs(element, attributes, mapping) {
    for (let name in attributes) {
      let values = attributes[name];

      name = (mapping && mapping[name]) || name;
      let eType = typeof element[name];
      if (eType === 'function') { // if it's a function call it 
        call(element, name, values);
      } else if (eType === 'undefined') { // It's undefied

        let setFn = 'set' + capitalize(name); // Lookup setter method

        if (typeof element[setFn] === 'function') { // call it if it excists
          call(element, setFn, values);
        } else { // Fallback to default behaviour
          try {
            element[name] = values;
          } catch {}
        }
      } else { // Default to just set the property
        try {
          element[name] = values;
        } catch {}
      }
    }
    return element;
  }

  function renderWidget(ast, parent) {
    if (ast.type) {
      if (NativeElements[ast.type] === undefined)
        throw new Error(`Unkown Element <${ast.type} />`);

      parent = NativeElements[ast.type](ast, parent) || parent;

      if (ast && ast.children) {
        for (let part of ast.children) {
          renderWidget(part, parent);
        }
      }
    } else if (Array.isArray(ast)) {
      for (let part of ast) {
        renderWidget(part, parent);
      }
    }
    return parent;
  }
}

module.exports.render = render;
module.exports.h = h;