// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;

// >>> Please include the content of index.js below this code <<<

const gradient = new LinearGradient();
gradient.locations = [0, 1];
gradient.colors = [new Color('#2193b0'), new Color('#6dd5ed')];

const widget = render`
    <ListWidget backgroundGradient=${gradient}> 
      <Text font=${Font.mediumSystemFont(14)}>Demo</Text>
      <Spacer />
      <HStack centerAlignContent>
        <Text font=${Font.boldSystemFont(12)}>Text</Text>
        <Spacer />
        <Text color=${Color.red()}>Red</Text>
        <Text font=${Font.boldSystemFont(12)}>Bold</Text>
      </HStack>
      <HStack centerAlignContent>
        <Text font=${Font.boldSystemFont(12)}>Symbols</Text>
        <Spacer />
        <Symbol name="flame" color=${Color.orange()} bold />
        <Symbol name="bolt" color=${Color.yellow()} thin />
      </HStack>
      <HStack centerAlignContent>
        <Text font=${Font.boldSystemFont(12)}>Image</Text>
        <Spacer />
        <Image image=${getImage()} size=${new Size(10, 10)} />
      </HStack>
      <HStack centerAlignContent>
        <Text font=${Font.boldSystemFont(12)}>Date</Text>
        <Spacer />
        <Date date=${new Date()} offsetStyle />
      </HStack>
      <Spacer />
    </ListWidget>
`;

if (!config.runsInWidget) {
  widget.presentSmall();
} else {
  Script.setWidget(widget);
  Script.complete();
}



// Image Helper
function getImage() {
  const ctx = new DrawContext();
  ctx.size = new Size(10, 10);
  ctx.respectScreenScale = true;

  ctx.setFillColor(Color.white());
  ctx.fillRect(new Rect(0,0,10,10))

  ctx.setFillColor(Color.blue());
  ctx.fillEllipse(new Rect(0,0,10,10))

  return ctx.getImage();
}



// helper function to download an image from a given url
async function loadImage(imgUrl) {
    const req = new Request(imgUrl)
    return await req.loadImage()
}
