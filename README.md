# DBP Interactive Tool

**[This is a draft of the tool for feedback]**

A simple educational example showing how different water treatment choices affect the formation of **Disinfection Byproducts (DBPs)** at each stage of the process. Students select options in three categories—Source Water, Treatment, and Distribution—and see the number and mix of DBPs update in real time.

## How to run

No build step. Open `index.html` in a modern browser (e.g. double-click the file or use “Open File” in the browser). For local development you can also use a simple static server:

```bash
# Python 3
python3 -m http.server 8000

# Node (npx)
npx serve
```

Then visit `http://localhost:8000` (or the port shown).

## Selection model

| Column        | Group                  | Options                                      |
|---------------|------------------------|----------------------------------------------|
| Source Water  | Organic Matter         | Low, Medium, High                            |
| Source Water  | Additional elements    | Bromine, Fluorine, Iodine, Nitrogen          |
| Treatment     | Primary Disinfectant   | Free Chlorine, Chloramine, Other             |
| Distribution  | Residual Disinfectant  | Free Chlorine, Chloramine                    |
| Distribution  | Travel Time (to tap)   | Low, Medium, High                            |

Selections influence how many of each DBP type appear at each stage (e.g. higher organic matter and longer travel time tend to increase counts; disinfectant type shifts the mix toward THMs, HAAs, HANs, or Others). The relationships are simplified for teaching, not strict chemistry.

## DBP types (legend)

- **Trihalomethanes (THMs)** – light brown  
- **Haloacetic Acids (HAAs)** – light blue  
- **Haloacetonitriles (HANs)** – light yellow  
- **Others** – red-brown  


