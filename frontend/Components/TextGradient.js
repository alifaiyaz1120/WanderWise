import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Svg, LinearGradient, Stop, Text } from 'react-native-svg';

const TextGradient = ({text, fontSize}) =>{
    return(
        <Svg height="40" width="100%">
            <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#4059AD" />
                <Stop offset="100%" stopColor="#FF006E" />
            </LinearGradient>
            <Text
                x="5%"
                y="50%"
                fontSize={fontSize}
                fill="url(#gradient)"
                textAlign="center"
            >
                {text}
            </Text>
        </Svg>
    );
}

const style = StyleSheet.create({

})

export default TextGradient;