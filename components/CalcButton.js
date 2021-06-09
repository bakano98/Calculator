import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

export default class CalcButton extends React.Component {
  static defaultProps = {
    onPress: function() { },
    title: "",
    color: "white",
    backgroundColor: "black",
    radius: 40,
    style: { },
  }
  
  render() {
    return (
      <TouchableOpacity 
        onPress={this.props.onPress}
        style={[styles.container, {backgroundColor: this.props.backgroundColor}, {...this.props.style}]}>
        <Text style={[styles.text, { color: this.props.color }]}>
          {this.props.title}  
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center",  margin: 5,
              width: 80, height: 80, borderRadius: 40},
  text: { fontSize: 30, fontWeight: "bold"}
});

CalcButton.defaultProps = {
  onPress: function() {}, // because CalcButton has to do something when pressed
  title: "testing",
  color: "",
  backgroundColor: "",
  style: { },
}


