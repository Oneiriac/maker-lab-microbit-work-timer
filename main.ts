//  30 minute timer
//  Number of minutes remaining scrolls on the screen
//  Servo only has 180 degrees of motion
//  ticks along every 5 mins
//  When timer expires, buzzer sounds
//  press button A for 5 minutes of break and to reset the servo
//  During this time the timer ticks along every 1 minute
//  When break timer expires, another buzzer
//  Press button A to silence the buzzer and to start another 30 minute timer
//  Define constants
let WORK_TIMER_LENGTH = 30
let WORK_TIMER_SERVO_MODULO = 5
let BREAK_TIMER_LENGTH = 10
let BREAK_TIMER_SERVO_MODULO = 2
let MAX_SERVO_ANGLE = 180
let TIME_STEP = 1000
//  increment that the timer uses
//  Initialise variables
let time_left = WORK_TIMER_LENGTH
let is_work_timer = true
let servo_angle = 0
//  max 180
control.inBackground(function display() {
    while (true) {
        if (time_left == 0) {
            basic.showString("!")
            basic.pause(300)
            basic.showString("")
            basic.pause(300)
        } else {
            basic.showNumber(time_left)
            basic.pause(100)
        }
        
    }
})
basic.forever(function main_loop() {
    let current_timer_length: number;
    let servo_modulo: number;
    
    
    if (is_work_timer) {
        current_timer_length = WORK_TIMER_LENGTH
        servo_modulo = WORK_TIMER_SERVO_MODULO
    } else {
        current_timer_length = BREAK_TIMER_LENGTH
        servo_modulo = BREAK_TIMER_SERVO_MODULO
    }
    
    while (time_left > 0) {
        //  Do a time step
        basic.pause(TIME_STEP)
        time_left -= 1
        //  Servo control
        servo_angle = (current_timer_length - time_left) / current_timer_length * 180
        if (time_left % servo_modulo == 0) {
            pins.servoWritePin(AnalogPin.P11, servo_angle)
        }
        
    }
    if (time_left == 0) {
        servo_angle = 0
        pins.servoWritePin(AnalogPin.P11, servo_angle)
    }
    
})
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    
    if (time_left > 0) {
        return
    }
    
    if (is_work_timer) {
        //  switch to break timer
        is_work_timer = false
        time_left = BREAK_TIMER_LENGTH
    } else {
        is_work_timer = true
        time_left = WORK_TIMER_LENGTH
    }
    
})
