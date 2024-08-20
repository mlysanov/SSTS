package ru.translateApp.entity;


public class PathInfo {

    private String path;
    private int counterOfTextNodes;
    private int counterOfUntranslatedTextNodes;
    private boolean hasUntranslatedTextNodes;

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public int getCounterOfTextNodes() {
        return counterOfTextNodes;
    }

    public void setCounterOfTextNodes(int counterOfTextNodes) {
        this.counterOfTextNodes = counterOfTextNodes;
    }

    public int getCounterOfUntranslatedTextNodes() {
        return counterOfUntranslatedTextNodes;
    }

    public void setCounterOfUntranslatedTextNodes(int counterOfUntranslatedTextNodes) {
        this.counterOfUntranslatedTextNodes = counterOfUntranslatedTextNodes;
    }

    public boolean isHasUntranslatedTextNodes() {
        return hasUntranslatedTextNodes;
    }

    public void setHasUntranslatedTextNodes(boolean hasUntranslatedTextNodes) {
        this.hasUntranslatedTextNodes = hasUntranslatedTextNodes;
    }

    @Override
    public String toString() {
        return "PathInfo{" +
                "path='" + path + '\'' +
                ", counterOfTextNodes=" + counterOfTextNodes +
                ", counterOfUntranslatedTextNodes=" + counterOfUntranslatedTextNodes +
                ", hasUntranslatedTextNodes=" + hasUntranslatedTextNodes +
                '}';
    }
}

