import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
    placeholder: string;
    secureTextEntry?: boolean;
    onChangeText: (text: string) => void;
    value: string;
}

const InputField: React.FC<InputFieldProps> = ({ placeholder, secureTextEntry = false, onChangeText, value, style }) => {
    return (
        <TextInput
            style={[styles.input, style]}
            placeholder={placeholder}
            placeholderTextColor='rgba(2, 81, 89, 1)'
            secureTextEntry={secureTextEntry}
            onChangeText={onChangeText}
            value={value}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        width: '80%',
        height: 55,
        backgroundColor: '#FFFDE3',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15, // Adiciona um espaço entre os campos
    },
});

export default InputField;
