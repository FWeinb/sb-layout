// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: calendar-alt;

// >>> Please include the index.js below this code <<<

const Themes = {
  dark: {
    background: new Color('#1b1c1e'),
    textPrimary: Color.white(),
    textSecondary: Color.gray(),
    textHighlight: Color.red()
  },
  light: {
    background: Color.white(),
    textPrimary: Color.black(),
    textSecondary: Color.gray(),
    textHighlight: Color.red()
  }
}

const Theme = Device.isUsingDarkAppearance() ? Themes.dark : Themes.light;
const data = await getWidgetData()
const widget = await createWidget(data)

if (!config.runsInWidget) {
  widget.presentSmall()
} else {
  Script.setWidget(widget)
}
Script.complete() 


async function getWidgetData() {
  const date = new Date();
  const todayEvents = (await CalendarEvent.today([]))
      .filter((event) => !event.isAllDay && event.startDate.getTime() > date.getTime()) 
      .slice(0, 2); 
  const tomorrowEvents = (await CalendarEvent.tomorrow([]))
  return {
    date,
    todayEvents,
    tomorrowEvents
  }
}

async function createWidget({ date, todayEvents, tomorrowEvents }) {
  const hasEventsToday = todayEvents.length > 0;
  const hasEventsTomorrow = tomorrowEvents.length > 0;
  
  if (hasEventsToday) {
    const secondsToFirstEventSince2001 = getSecondsSince2001(todayEvents[0].startDate);
    return render`
      <ListWidget url=${'calshow:' + secondsToFirstEventSince2001} backgroundColor=${Theme.background} padding=${[17,13,12,13]}>
        <${DateHeader} date=${date} />
        <Spacer length=${3}/>
        <VStack spacing=${6} padding=${[0,0,0,0]}>
          <${Events} events=${todayEvents} />
        </VStack>
        <Spacer />
      </ListWidget>
    `;
  } else if (hasEventsTomorrow) {
    const firstEventTomorrow = [tomorrowEvents[0]];
    const moreEventCount = tomorrowEvents.length - 1
    const calenderIndicators = tomorrowEvents
                                  .filter((_, index) => index > 0)
                                  .map((event) => event.calendar.color.hex)
                                  .filter((value, index, self) => self.indexOf(value) === index)
                                  .reverse()

    return render`
      <ListWidget backgroundColor=${Theme.background} padding=${[17,13,12,13]}>
        <${DateHeader} date=${date} />
        <Spacer />
        <HStack padding=${[0,2,5,0]}>
          <Text color=${Theme.textSecondary} font=${Font.semiboldSystemFont(11)}>TOMORROW</Text>
        </HStack>
        <VStack spacing=${6} padding=${[0,0,0,0]}>
          <${Events} events=${firstEventTomorrow} />
          <HStack padding=${[0,0,0,0]} centerAlignContent>
            <HStack spacing=${3}>
              ${calenderIndicators.map((hex) => h`
                <${CalendarIndicator} spacing=${-2} color=${new Color(`#${hex}`)} />
              `)}
            </HStack>
            <Spacer length=${5} />
            <Text color=${Theme.textSecondary} font=${Font.regularSystemFont(11)}>${moreEventCount} more events</Text>
          </HStack>
        </VStack>
        <Spacer />
      </ListWidget>
    `;
  }

  // No Events 
  const secondsToToday = getSecondsSince2001(date);
  return render`
    <ListWidget url=${'calshow:' + secondsToToday} backgroundColor=${Theme.background} padding=${[17,13,12,13]}>
      <${DateHeader} date=${date} />
      <Spacer />
      <HStack padding=${[0,2,0,0]}>
        <Text color=${Theme.textSecondary} font=${Font.systemFont(15)}>No more events today</Text>
      </Stack>
      <Spacer />
    </ListWidget>
  `;
}

function DateHeader({ date }) {
  const df = new DateFormatter()
  df.dateFormat = "EEEE";

  return h`
  <VStack padding=${[0,2,0,0]}>
    <HStack>
      <VStack spacing=${-3}>
        <Text color=${Theme.textHighlight} font=${Font.semiboldSystemFont(11)}>${df.string(date).toUpperCase()}</Text>
        <Text color=${Theme.textPrimary} font=${Font.lightSystemFont(33)}>${date.getDate().toString()}</Text>
      </VStack>
      <Spacer />
    </HStack>
  </VStack>
  `;
}

function Events({ events }) {
  const hasMoreThanOneEvent = events.length > 1;
  const lineLimit = hasMoreThanOneEvent ? 1 : undefined;
  return events.map((event) => {
    const secondsSince2001 = !event.isAllDay && getSecondsSince2001(event.startDate);
    return h`
    <HStack url=${'calshow:' + secondsSince2001} padding=${[0,0,0,0]} centerAlignContent>
      <${CalendarIndicator} color=${new Color(`#${event.calendar.color.hex}`)} />
      <Spacer length=${5} />
      <VStack>
        <Text color=${Theme.textPrimary} font=${Font.semiboldSystemFont(13)} lineLimit=${lineLimit}>${event.title}</Text>
        ${!event.isAllDay && h`<Text color=${Theme.textSecondary} font=${Font.regularSystemFont(12)} lineLimit=${lineLimit}>${formatTime(event)}</Text>`}
      </VStack>
    </HStack>
  `});
}

function CalendarIndicator({ spacing, color }) {
  return h`
    <VStack spacing=${spacing} cornerRadius=${2} backgroundColor=${color}>
      <Spacer />
      <HStack size=${new Size(4, 0)} />
      <Spacer />
    </VStack>
  `;
}

function formatTime({startDate, endDate}) {
  const df = new DateFormatter()
  df.useNoDateStyle()
  df.useShortTimeStyle()
  return `${df.string(startDate)} – ${df.string(endDate)}`
}

function getSecondsSince2001(date) {
  return Math.round((date.getTime() - Date.UTC(2001,0,1)) / 1000)
}

