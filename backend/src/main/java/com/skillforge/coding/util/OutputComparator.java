package com.skillforge.coding.util;

public class OutputComparator {

    public static boolean isOutputCorrect(String actual, String expected) {
        if (actual == null || expected == null) return false;

        String normalizedActual = normalize(actual);
        String normalizedExpected = normalize(expected);

        return normalizedActual.equals(normalizedExpected);
    }

    private static String normalize(String s) {
        return s
                .trim()
                .replaceAll("\\s+", " ");
    }
}
