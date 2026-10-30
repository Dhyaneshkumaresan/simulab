import { EmbeddedBoardState, VirtualPin } from '../types/circuit';

export interface EmbeddedProgram {
  id: string;
  name: string;
  board: 'arduino-uno' | 'esp32';
  description: string;
  code: string;
  targetHardware: string[];
}

export const EMBEDDED_PRESET_PROGRAMS: EmbeddedProgram[] = [
  {
    id: 'blink',
    name: 'Standard LED Blink (Pin 13)',
    board: 'arduino-uno',
    description: 'Toggles the onboard LED on Pin 13 every 1 second.',
    targetHardware: ['Onboard LED', 'Digital Pin 13'],
    code: `// ECE SIMULAB - Arduino UNO Blink
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("System Initialized: Blink Program Running");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  Serial.println("LED ON (5V)");
  delay(1000);
  
  digitalWrite(ledPin, LOW);
  Serial.println("LED OFF (0V)");
  delay(1000);
}`,
  },
  {
    id: 'traffic_light',
    name: 'Traffic Light State Machine',
    board: 'arduino-uno',
    description: 'Sequences Red (Pin 12), Yellow (Pin 11), and Green (Pin 10) LEDs with pedestrian button interrupt.',
    targetHardware: ['Red LED', 'Yellow LED', 'Green LED', 'Pedestrian Pushbutton'],
    code: `// ECE SIMULAB - 3-Way Traffic Light System
const int RED_PIN = 12;
const int YELLOW_PIN = 11;
const int GREEN_PIN = 10;
const int BUTTON_PIN = 2;

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(9600);
  Serial.println("Traffic Controller Ready.");
}

void loop() {
  // Phase 1: GREEN
  digitalWrite(GREEN_PIN, HIGH);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(RED_PIN, LOW);
  Serial.println("[STATE] Green Light - Traffic Flowing");
  delay(2500);

  // Phase 2: YELLOW
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(YELLOW_PIN, HIGH);
  Serial.println("[STATE] Yellow Light - Prepare to Stop");
  delay(1000);

  // Phase 3: RED
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(RED_PIN, HIGH);
  Serial.println("[STATE] Red Light - STOP");
  delay(3000);
}`,
  },
  {
    id: 'pot_pwm_fader',
    name: 'Analog Potentiometer & PWM LED Fader',
    board: 'arduino-uno',
    description: 'Reads analog input from Potentiometer (A0) and modulates LED brightness via PWM (Pin 9).',
    targetHardware: ['Potentiometer A0', 'PWM LED Pin 9', 'Voltmeter'],
    code: `// ECE SIMULAB - ADC Reading & PWM Brightness Control
const int potPin = A0;
const int ledPin = 9; // PWM pin

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("ADC to PWM Dimmer Online.");
}

void loop() {
  int sensorValue = analogRead(potPin); // 0 to 1023
  int brightness = map(sensorValue, 0, 1023, 0, 255); // 8-bit PWM
  float voltage = sensorValue * (5.0 / 1023.0);
  
  analogWrite(ledPin, brightness);
  Serial.print("Pot ADC: ");
  Serial.print(sensorValue);
  Serial.print(" | Voltage: ");
  Serial.print(voltage);
  Serial.print("V | PWM Duty: ");
  Serial.println(brightness);
  delay(200);
}`,
  },
  {
    id: 'servo_sweep',
    name: 'Micro Servo Motor Sweep (0° - 180°)',
    board: 'arduino-uno',
    description: 'Generates precise 50Hz PWM pulse train to sweep servo arm from 0° to 180° and back.',
    targetHardware: ['Servo Motor Pin 9'],
    code: `// ECE SIMULAB - Servo Motor Sweep Simulator
#include <Servo.h>

Servo myservo;
int pos = 0;

void setup() {
  myservo.attach(9);
  Serial.begin(9600);
  Serial.println("Servo Calibrated: Starting 0 - 180 Sweep");
}

void loop() {
  for (pos = 0; pos <= 180; pos += 15) {
    myservo.write(pos);
    Serial.print("Servo Angle: ");
    Serial.print(pos);
    Serial.println(" deg");
    delay(100);
  }
  for (pos = 180; pos >= 0; pos -= 15) {
    myservo.write(pos);
    Serial.print("Servo Angle: ");
    Serial.print(pos);
    Serial.println(" deg");
    delay(100);
  }
}`,
  },
  {
    id: 'seven_segment',
    name: '7-Segment Decimal Counter (0 to 9)',
    board: 'arduino-uno',
    description: 'Drives a common-cathode 7-segment display displaying decimal digits 0 through 9.',
    targetHardware: ['7-Segment Display (Pins 4-10)'],
    code: `// ECE SIMULAB - 7-Segment Display Counter
int count = 0;

void setup() {
  for (int pin = 4; pin <= 10; pin++) {
    pinMode(pin, OUTPUT);
  }
  Serial.begin(9600);
  Serial.println("7-Segment Display Active");
}

void loop() {
  Serial.print("Displaying Digit: ");
  Serial.println(count);
  count = (count + 1) % 10;
  delay(1000);
}`,
  },
  {
    id: 'esp32_iot_sensor',
    name: 'ESP32 Smart IoT Sensor & LCD Display',
    board: 'esp32',
    description: 'Reads simulated ambient temperature/humidity and publishes to 16x2 I2C LCD and Serial.',
    targetHardware: ['ESP32 DevKit', 'I2C LCD 16x2', 'Analog Temp Sensor'],
    code: `// ECE SIMULAB - ESP32 IoT Environmental Monitor
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 Dual-Core 240MHz Booting...");
  Serial.println("WiFi Connected: IP 192.168.4.102");
  Serial.println("I2C LCD Initialized at 0x27");
}

void loop() {
  float tempC = 24.5 + (random(-15, 15) / 10.0);
  float humidity = 58.0 + (random(-30, 30) / 10.0);
  
  Serial.print("[IoT Telemetry] Temp: ");
  Serial.print(tempC);
  Serial.print(" C | Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
  
  delay(2000);
}`,
  },
];

export function createInitialBoardState(boardType: 'arduino-uno' | 'esp32'): EmbeddedBoardState {
  const pins: Record<number, VirtualPin> = {};

  if (boardType === 'arduino-uno') {
    // Pins 0-13 Digital
    for (let i = 0; i <= 13; i++) {
      pins[i] = {
        pinNumber: i,
        label: i === 13 ? 'D13 (LED)' : i === 9 || i === 10 || i === 11 || i === 3 || i === 5 || i === 6 ? `~D${i}` : `D${i}`,
        mode: i === 13 ? 'OUTPUT' : 'INPUT',
        value: 0,
      };
    }
  } else {
    // ESP32 pins
    const espPins = [2, 4, 5, 12, 13, 14, 15, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 34, 35];
    espPins.forEach((p) => {
      pins[p] = {
        pinNumber: p,
        label: `GPIO${p}`,
        mode: 'OUTPUT',
        value: 0,
      };
    });
  }

  return {
    boardType,
    powerOn: true,
    running: false,
    pins,
    serialOutput: ['[ECE SIMULAB] Virtual MCU initialized and ready.'],
    analogInputs: { 0: 512, 1: 0 },
    pushButtons: { 2: false },
    cycleCount: 0,
    sevenSegmentValue: '0',
    lcdMessage: 'ECE SIMULAB v2.0\nReady for code..',
    servoAngleDeg: 0,
  };
}

// Tick simulation step for the active program
export function executeProgramStep(
  program: EmbeddedProgram,
  state: EmbeddedBoardState
): EmbeddedBoardState {
  const next = { ...state, pins: { ...state.pins } };
  next.cycleCount += 1;
  const cycle = next.cycleCount;

  switch (program.id) {
    case 'blink': {
      // Toggle Pin 13 every 2 ticks
      const isHigh = Math.floor(cycle / 2) % 2 === 0;
      next.pins[13] = { ...next.pins[13], value: isHigh ? 1 : 0 };
      const log = isHigh ? `[${cycle * 500}ms] digitalWrite(13, HIGH) -> LED ON` : `[${cycle * 500}ms] digitalWrite(13, LOW) -> LED OFF`;
      next.serialOutput = [...next.serialOutput.slice(-30), log];
      break;
    }

    case 'traffic_light': {
      // Phase sequence: 0-3 Green (Pin 10), 4 Yellow (Pin 11), 5-8 Red (Pin 12)
      const phase = cycle % 9;
      const red = phase >= 5 ? 1 : 0;
      const yellow = phase === 4 ? 1 : 0;
      const green = phase < 4 ? 1 : 0;

      next.pins[10] = { ...next.pins[10], value: green };
      next.pins[11] = { ...next.pins[11], value: yellow };
      next.pins[12] = { ...next.pins[12], value: red };

      const stateName = green ? 'GREEN (Traffic Flowing)' : yellow ? 'YELLOW (Prepare to Stop)' : 'RED (STOP)';
      next.serialOutput = [...next.serialOutput.slice(-30), `[Step ${cycle}] Traffic State: ${stateName}`];
      break;
    }

    case 'pot_pwm_fader': {
      const potVal = next.analogInputs[0] ?? 512;
      const pwmVal = Math.round((potVal / 1023) * 255);
      const volts = ((potVal * 5.0) / 1023).toFixed(2);
      next.pins[9] = { ...next.pins[9], value: pwmVal, mode: 'PWM' };
      next.serialOutput = [
        ...next.serialOutput.slice(-30),
        `[ADC A0] Raw: ${potVal} (${volts}V) -> PWM Pin 9 Duty: ${pwmVal} / 255 (${Math.round((pwmVal / 255) * 100)}%)`,
      ];
      break;
    }

    case 'servo_sweep': {
      // 0 to 180 and back
      const step = cycle % 24;
      const angle = step <= 12 ? step * 15 : (24 - step) * 15;
      next.servoAngleDeg = angle;
      next.serialOutput = [...next.serialOutput.slice(-30), `[Servo Pin 9] Angle Set: ${angle}° (PWM Pulse: ${1000 + (angle / 180) * 1000}µs)`];
      break;
    }

    case 'seven_segment': {
      const digit = cycle % 10;
      next.sevenSegmentValue = digit.toString();
      next.serialOutput = [...next.serialOutput.slice(-30), `[7-Segment] Output Digit: ${digit}`];
      break;
    }

    case 'esp32_iot_sensor': {
      const temp = (24.0 + Math.sin(cycle * 0.4) * 3).toFixed(1);
      const hum = (60.0 + Math.cos(cycle * 0.3) * 5).toFixed(0);
      next.lcdMessage = `Temp: ${temp} C\nHumidity: ${hum} %`;
      next.serialOutput = [...next.serialOutput.slice(-30), `[MQTT Pub] {"temp": ${temp}, "hum": ${hum}, "rssi": -62dBm}`];
      break;
    }
  }

  return next;
}
