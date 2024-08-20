package ru.translateApp.entity;

import java.util.List;

public class Data {

    private String pathToSourceArchive;
    private int counterOfUntranslatedWords;
    private String statusOfTranslatedPage;
    private List<PathInfo> pathsToHTML;

    public String getPathToSourceArchive() {
        return pathToSourceArchive;
    }

    public int getCounterOfUntranslatedWords() {
        return counterOfUntranslatedWords;
    }

    public String getStatusOfTranslatedPage() {
        return statusOfTranslatedPage;
    }

    public void setStatusOfTranslatedPage(String statusOfTranslatedPage) {
        this.statusOfTranslatedPage = statusOfTranslatedPage;
    }

    public void setCounterOfUntranslatedWords(int counterOfUntranslatedWords) {
        this.counterOfUntranslatedWords = counterOfUntranslatedWords;
    }

    public void setPathToSourceArchive(String pathToSourceArchive) {
        this.pathToSourceArchive = pathToSourceArchive;
    }

    public List<PathInfo> getPathsToHTML() {
        return pathsToHTML;
    }

    public void setPathsToHTML(List<PathInfo> pathsToHTML) {
        this.pathsToHTML = pathsToHTML;
    }

    @Override
    public String toString() {
        return "Data{" +
                "pathToSourceArchive='" + pathToSourceArchive + '\'' +
                ", counterOfUntranslatedWords=" + counterOfUntranslatedWords +
                ", statusOfTranslatedPage=" + statusOfTranslatedPage +
                ", pathsToHTML=" + pathsToHTML +
                '}';
    }
}

