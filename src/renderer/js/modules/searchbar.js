export class SearchBar {
    constructor(inputElement) {
        this.inputElement = inputElement;
        this.itemList = [];
        this.itemNames = [];
    }

    normalizeName(name) {
        const blacklistedRegex = /[\\\/:*?"<>|]/g;

        let normalized = name
            .trim()
            .toLowerCase()
            .replace(blacklistedRegex, "")
            .replace(/\s+/g, "-")
            .replace(/^[-]+|[-]+$/g, "");

        return normalized;
    }

    initialize(projectsContainer) {
        this.inputElement.addEventListener("input", (event) => {
            this.itemList.splice(0, this.itemList.length);
            this.itemList = Array.from(projectsContainer.querySelectorAll(".project"));

            this.itemNames.splice(0, this.itemNames.length);
            this.itemList.forEach(projectCard => {
                projectCard.classList.toggle("hidden", true);
                this.itemNames.push(projectCard.id);
            });

            try {
                const searchValue = this.inputElement.value.trim().toLowerCase();
                const searchWords = this.normalizeName(searchValue).split("-").filter(word => word !== "");

                this.itemNames.forEach((item, index) => {
                    const itemText = item.toLowerCase();
                    const result = this.itemList[index];

                    let match = true;

                    searchWords.forEach(word => {
                        if (!itemText.includes(word)) {
                            match = false;
                        }
                    });

                    if (match) {
                        result.classList.toggle("hidden", false);
                    }
                });
            } catch (error) {
                console.error(error);
            }
        });
    }
}