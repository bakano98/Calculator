/* Create a colour palette here:
https://coolors.co/fff07c-80ff72-7ee8fa-eec0c6-e58c8a
*/

require("../lib/swisscalc.lib.format.js");
require("../lib/swisscalc.lib.operator.js");
require("../lib/swisscalc.lib.operatorCache.js");
require("../lib/swisscalc.lib.shuntingYard.js");
require("../lib/swisscalc.display.numericDisplay.js");
require("../lib/swisscalc.display.memoryDisplay.js");
require("../lib/swisscalc.calc.calculator.js");

import React from "react";
import { View, PanResponder, StyleSheet, Text, Button, TouchableOpacity, Image} from 'react-native';
// for locally stored data
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalcButton, CalcDisplay } from './../components';
import DialogInput from 'react-native-dialog-input';


// the keys for customised buttons
const COLOUR_KEY_ONE = 'colour_key_one';
const COLOUR_KEY_TWO = 'colour_key_two';
const COLOUR_KEY_THREE = 'colour_key_three';
const BG_COLOUR_KEY = 'colour_bg';
const FONT_COLOUR_KEY = 'font_colour';
const SETUP_KEY = 'setup_key';

const DONE = true;
const NOT_DONE = false;

export default class CalculatorScreen extends React.Component {
  constructor(props) { 
    super(props);
    this.state = {
      display: "0",
      // portrait mode only.
      orientation: "portrait",
      firstStart: true,
      custom: false, // set to false after finishing customisation coding
      // default colours
      colour_one: '#00BCD4', // for all the digits
      colour_two: '#03A9F4', // for the operators
      colour_three: '#607D8B', // for the rest.
      colour_bg: 'black', // for the background
      font_colour: 'white',
      // for custom colour
      isDialogVisible1: false,
      isDialogVisible2: false,
      isDialogVisible3: false,
      isDialogVisibleFontColour: false,
      isDialogVisibleBgColour: false,
      loading: NOT_DONE
    }

    // initialise calculator
    this.oc = global.swisscalc.lib.operatorCache;
    this.calc = new swisscalc.calc.calculator();

    // initialise PanResponder (for swiping actions)
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) =>true,
      onPanResponderMove: (evt, gestureState) => { },
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) >= 50) {
          this.onBackspacePress();
        }
      }
    });
  }

  // calculator functions
  onDigitPress = (digit) => {
    this.calc.addDigit(digit);
    this.setState({display: this.calc.getMainDisplay()});
  };

  onClearPress = () => {
    this.calc.clear();
    this.setState({display: this.calc.getMainDisplay()});
  };

  addBinaryOperator = (operator) => {
    this.calc.addBinaryOperator(operator);
    this.setState({display: this.calc.getMainDisplay()});
  };

  onNegatePress = () => {
    this.calc.negate();
    this.setState({display: this.calc.getMainDisplay()});
  };

  onEquals = () => {
    this.calc.equalsPressed();
    this.setState({display: this.calc.getMainDisplay()});
  };

  onBackspacePress = () => {
    this.calc.backspace();
    this.setState({display: this.calc.getMainDisplay()});
  };

  /* first-time setup functions */
  // for the numerics
  storeColourOne = async (key, colour) => {
    try {
      await AsyncStorage.setItem(COLOUR_KEY_ONE, JSON.stringify(colour));
      this.setState({colour_one: colour})
    } catch (e) {
      console.log(e)
    }
  }

  // for the operators
  storeColourTwo = async (key, colour) => {
    try {
      await AsyncStorage.setItem(COLOUR_KEY_TWO, JSON.stringify(colour));
      this.setState({colour_two: colour})
    } catch (e) {
      console.log(e)
    }
  }

  // for the rest.
  storeColourThree = async (key, colour) => {
    try {
      await AsyncStorage.setItem(COLOUR_KEY_THREE, JSON.stringify(colour));
      this.setState({colour_three: colour})
    } catch (e) {
      console.log(e)
    }
  }

  // for the background
  storeBGColour = async (key, colour) => {
    try {
      await AsyncStorage.setItem(BG_COLOUR_KEY, JSON.stringify(colour));
      this.setState({colour_bg: colour})
    } catch (e) {
      console.log(e)
    }
  }

  storeFontColour = async (key, colour) => {
    try {
      await AsyncStorage.setItem(FONT_COLOUR_KEY, JSON.stringify(colour));
      this.setState({font_colour: colour})
    }
    catch (e) {
      console.log(e)
    }
  }

  // not a good solution as it won't scale well, but quick and easy.
  customSetup = () => {
    // sets custom state to true, so that we can go to our custom setup.
    this.setState({custom: true});
  }

  loadDefault = () => {
    this.storeColourOne(COLOUR_KEY_ONE,'#00BCD4');
    this.storeColourTwo(COLOUR_KEY_TWO,'#03A9F4');
    this.storeColourThree(COLOUR_KEY_THREE,'#607D8B');
    this.storeBGColour(BG_COLOUR_KEY,'black');
    this.storeFontColour(FONT_COLOUR_KEY,'white');
  }

  // to identify if it is first startup
  firstStartUpOver = async (key, value) => {
    try {
      await AsyncStorage.setItem(SETUP_KEY, JSON.stringify(value));
      this.setState({firstStart: value});
    } catch (e) {
      console.log(e)
    }
  }

  // for custom colour handling
  handleCancel = () => {
    this.setState({ 
      isDialogVisible1: false,
      isDialogVisible2: false,
      isDialogVisible3: false,
      isDialogVisibleFontColour: false,
      isDialogVisibleBgColour: false
    })
  }

  // for simple error handling because colours do not take any white space.
  stringHasTheWhiteSpaceOrNot = (value) => {
    return value.indexOf(' ') >= 0;
  }

  pick1 = (colour) => {
    const noWhiteSpace = !this.stringHasTheWhiteSpaceOrNot(colour);
    if (noWhiteSpace) {
      this.storeColourOne(COLOUR_KEY_ONE, colour);
      this.setState({first: DONE});
    } else {
      // do nothing
    }
  }

  pick2 = (colour) => {
    const noWhiteSpace = !this.stringHasTheWhiteSpaceOrNot(colour);
    if (noWhiteSpace) {
      this.storeColourTwo(COLOUR_KEY_TWO, colour);
      this.setState({second: DONE});
    } else {
      // do nothing
    }
  }

  pick3 = (colour) => {
    const noWhiteSpace = !this.stringHasTheWhiteSpaceOrNot(colour);
    if (noWhiteSpace) {
      this.storeColourThree(COLOUR_KEY_THREE, colour);
      this.setState({three: DONE});
    } else {
      // do nothing
    }
  }

  pickFont = (colour) => {
    const noWhiteSpace = !this.stringHasTheWhiteSpaceOrNot(colour);
    if (noWhiteSpace) {
      this.storeFontColour(FONT_COLOUR_KEY, colour);
      this.setState({font: DONE});
    } else {
      // do nothing
    }
  }

  pickBg = (colour) => {
    const noWhiteSpace = !this.stringHasTheWhiteSpaceOrNot(colour);
    if (noWhiteSpace) {
      this.storeBGColour(BG_COLOUR_KEY, colour);
      this.setState({bg: DONE})
    } else {
      // do nothing
    }
  }

  // where inputText is the colour given by the user
  handleConfirm = (inputText) => {
    // check which dialog is visible...
    if (this.state.isDialogVisible1) {
      this.pick1(inputText);
      this.setState({ isDialogVisible1: false });
    } else if (this.state.isDialogVisible2) {
      this.pick2(inputText)
      this.setState({ isDialogVisible2: false });
    } else if (this.state.isDialogVisible3) {
      this.pick3(inputText)
      this.setState({ isDialogVisible3: false });
    } else if (this.state.isDialogVisibleFontColour) {
      this.pickFont(inputText)
      this.setState({ isDialogVisibleFontColour: false });
    } else if (this.state.isDialogVisibleBgColour) {
      this.pickBg(inputText)
      this.setState({ isDialogVisibleBgColour: false });
    }
  }

  setCustom1 = () => {
    this.setState({ isDialogVisible1: true });
  }

  setCustom2 = () => {
    this.setState({ isDialogVisible2: true });
  }

  setCustom3 = () => {
    this.setState({ isDialogVisible3: true });
  }

  setCustomFont = () => {
    this.setState({ isDialogVisibleFontColour: true });
  }

  setCustomBg = () => {
    this.setState({ isDialogVisibleBgColour: true });
  }


  // to load from cached data
  loadAsyncData = async () => {
    try {
      const showColourOne = await AsyncStorage.getItem(COLOUR_KEY_ONE);
      if (showColourOne !== null) {
        this.setState({colour_one: JSON.parse(showColourOne)})
      } 
    } catch (e) {
      console.log(e);
    } try {
      const showColourTwo = await AsyncStorage.getItem(COLOUR_KEY_TWO);
      if (showColourTwo !== null) {
        this.setState({colour_two: JSON.parse(showColourTwo)})
      } 
    } catch (e) {
      console.log(e);
    } try {
      const showColourThree = await AsyncStorage.getItem(COLOUR_KEY_THREE);
      if (showColourThree !== null) {
        this.setState({colour_three: JSON.parse(showColourThree)})
      } 
    } catch (e) {
      console.log(e);
    } try {
      const showBGColour = await AsyncStorage.getItem(BG_COLOUR_KEY);
      if (showBGColour !== null) {
        this.setState({colour_bg: JSON.parse(showBGColour)});
      }
    } catch (e) {
      console.log(e)
    } try {
      const showFontColour = await AsyncStorage.getItem(FONT_COLOUR_KEY);
      if (showFontColour !== null) {
        this.setState({font_colour: JSON.parse(showFontColour)});
      }
    } catch (e) {
      console.log(e);
    } try {
      const firstStart = await AsyncStorage.getItem(SETUP_KEY);
      if (firstStart !== null) {
        this.setState({firstStart: JSON.parse(firstStart)});
      }
    } catch (e) {
      console.log(e);
    }
  }

  loadDefaultAndGoToNext = () => {
    this.firstStartUpOver(SETUP_KEY, false);
  }
  componentDidMount() {
    // timeout to allow loadAsyncData to finish async request
    setTimeout(() => {this.setState({loading: DONE})}, 500);
    this.loadAsyncData();
  }



  render() {
    if (!this.state.loading) {
      return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image source={require('../assets/calculator.png')}/>
      </View>
        );
    } else {
      if (this.state.firstStart && !this.state.custom) {
        return (
          <View style={[styles.container, {justifyContent: 'center'}]}> 
            <Text style={{color: 'white', textAlign: 'center', fontSize: 30}}>This is your first startup. Please complete the setup.</Text>
            <TouchableOpacity style={{marginBottom: 10}}>
              <Button title="Custom" onPress={() => this.customSetup()}> </Button>
            </TouchableOpacity>
            <TouchableOpacity>
              <Button title="Default" onPress={() => this.loadDefaultAndGoToNext()}> </Button>
            </TouchableOpacity>
          </View>);
      } if (this.state.custom && this.state.firstStart) {
        return (
          <View style={[styles.container, {justifyContent: 'center', backgroundColor: this.state.colour_bg}]}>
            <View>
              <DialogInput isDialogVisible={this.state.isDialogVisible1}
                title={"Custom button colour"}
                message={"What colour do you want? (provide HEX codes with # for better accuracy"}
                submitInput={ (inputText) => {this.handleConfirm(inputText)} }
                closeDialog={ () => {this.handleCancel()}}>
              </DialogInput>
            </View>
            <View>
              <DialogInput isDialogVisible={this.state.isDialogVisible2}
                title={"Custom button colour"}
                message={"What colour do you want? (provide HEX codes with # for better accuracy"}
                submitInput={ (inputText) => {this.handleConfirm(inputText)} }
                closeDialog={ () => {this.handleCancel()}}>
              </DialogInput>
            </View>
            <View>
              <DialogInput isDialogVisible={this.state.isDialogVisible3}
                title={"Custom button colour"}
                message={"What colour do you want? (provide HEX codes with # for better accuracy"}
                submitInput={ (inputText) => {this.handleConfirm(inputText)} }
                closeDialog={ () => {this.handleCancel()}}>
              </DialogInput>
            </View>
            <View>
              <DialogInput isDialogVisible={this.state.isDialogVisibleFontColour}
                title={"Custom font colour"}
                message={"What colour do you want? (provide HEX codes with # for better accuracy"}
                submitInput={ (inputText) => {this.handleConfirm(inputText)} }
                closeDialog={ () => {this.handleCancel()}}>
              </DialogInput>
            </View>
            <View>
              <DialogInput isDialogVisible={this.state.isDialogVisibleBgColour}
                title={"Custom background colour"}
                message={"What colour do you want? (provide HEX codes with # for better accuracy"}
                submitInput={ (inputText) => {this.handleConfirm(inputText)} }
                closeDialog={ () => {this.handleCancel()}}>
              </DialogInput>
            </View>
            <View style={[styles.buttonRow, {marginBottom: 20}]}>
              <CalcButton title="C" onPress={() => this.setCustom1()} backgroundColor={this.state.colour_one} color={this.state.font_colour}/>
              <CalcButton title="7" onPress={() => this.setCustom2()} backgroundColor={this.state.colour_two} color={this.state.font_colour}/>
              <CalcButton title="x" onPress={() => this.setCustom3()} backgroundColor={this.state.colour_three} color={this.state.font_colour}/>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
              <TouchableOpacity style={{backgroundColor: 'antiquewhite', alignItems: 'center', width: 150}}> 
                <Text style={[styles.colourPickerText, {color: 'black'}]} onPress={() => this.setCustomFont()}> Font </Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
              <TouchableOpacity style={{backgroundColor: 'antiquewhite', alignItems: 'center', width: 150}}> 
                <Text style={[styles.colourPickerText, {color: 'black'}]} onPress={() => this.setCustomBg()}> Background </Text>
              </TouchableOpacity>
            </View>
            <View style={{marginTop: 20, flexDirection: 'row', justifyContent: 'center',}}>
              <TouchableOpacity style={{backgroundColor: 'antiquewhite', alignItems: 'center', width: 150}} onPress={() => this.firstStartUpOver(SETUP_KEY, false)}> 
                <Text style={[styles.colourPickerText, {color: 'black'}]}> Confirm </Text>
              </TouchableOpacity>
            </View>
            <View style={{marginTop: 20, flexDirection: 'row', justifyContent: 'center',}}>
              <TouchableOpacity style={{backgroundColor: 'antiquewhite', alignItems: 'center', width: 150}} onPress={() => this.loadDefault()}> 
                <Text style={[styles.colourPickerText, {color: 'black'}]}> Load Default </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      } else {
        return(
          <View style={[styles.container, {backgroundColor: this.state.colour_bg}]}>
            <View style={styles.buttonRow}>
            <CalcButton style={{ marginTop: 50, flex:4}} onPress={() => this.firstStartUpOver(SETUP_KEY, true)} title="Re-customise" backgroundColor={this.state.colour_one} color={this.state.font_colour}/>
            </View>
            <View style={styles.displayContainer} {...this.panResponder.panHandlers}>
              <CalcDisplay display={this.state.display}/>
            </View>
            <View style={styles.buttonRow}>
              <CalcButton onPress={() => this.onClearPress()} title="C" backgroundColor={this.state.colour_one} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.onNegatePress()} title="+/-" backgroundColor={this.state.colour_one} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.addBinaryOperator(this.oc.ModulusOperator)} title="%" backgroundColor={this.state.colour_one} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.addBinaryOperator(this.oc.DivisionOperator)} title="/" backgroundColor={this.state.colour_three} color={this.state.font_colour}/>
            </View>
            <View style={styles.buttonRow}>
              <CalcButton onPress={() => this.onDigitPress("7")} title="7" backgroundColor={this.state.colour_two} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.onDigitPress("8")} title="8" backgroundColor={this.state.colour_two} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.onDigitPress("9")} title="9" backgroundColor={this.state.colour_two} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.addBinaryOperator(this.oc.MultiplicationOperator)} title="x" backgroundColor={this.state.colour_three} color={this.state.font_colour}/>
            </View>
            <View style={styles.buttonRow}>
              <CalcButton onPress={() => this.onDigitPress("4")} title="4" backgroundColor={this.state.colour_two} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.onDigitPress("5")} title="5" backgroundColor={this.state.colour_two} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.onDigitPress("6")} title="6" backgroundColor={this.state.colour_two} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.addBinaryOperator(this.oc.SubtractionOperator)} title="-" backgroundColor={this.state.colour_three} color={this.state.font_colour}/>
            </View>
            <View style={styles.buttonRow}>
              <CalcButton onPress={() => this.onDigitPress("1")} title="1" backgroundColor={this.state.colour_two} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.onDigitPress("2")} title="2" backgroundColor={this.state.colour_two} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.onDigitPress("3")} title="3" backgroundColor={this.state.colour_two} color={this.state.font_colour}/>
              <CalcButton onPress={() => this.addBinaryOperator(this.oc.AdditionOperator)} title="+" backgroundColor={this.state.colour_three} color={this.state.font_colour}/>
            </View>
            <View style={styles.buttonRow}>
              <CalcButton onPress={() => this.onDigitPress("0")} title="0" backgroundColor={this.state.colour_two} color={this.state.font_colour} style={{flex: 2}}/>
              <CalcButton onPress={() => this.onDigitPress(".")} title="." backgroundColor={this.state.colour_three} color={this.state.font_colour} />
              <CalcButton onPress={() => this.onEquals()} title="=" backgroundColor={this.state.colour_three} color={this.state.font_colour} />
            </View>
          </View>
        )
      }
    }
  }
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  displayContainer: { flex: 1, justifyContent: "flex-end"},
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  colourPicker: {alignItems: 'center', width: 80},
  colourPickerText: {fontSize: 15, color: 'white'} 
})