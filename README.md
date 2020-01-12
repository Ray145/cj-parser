
# cj-parser


## Summary 

The cj-parser is a component, part of a pet project, that is responsible for parsing .cj files and import them into a target database.

Cj files contain description of hardware boards, properties of the components used for such boards, details and coordinates of how those board circuits are composed. 
The aim of the whole project (which was unfortunately eventually abandoned) was to use this data and visualize such boards with their circuits and layers.

This component currently supports two target databases: MongoDB and PostgreSQL.
Because we needed to also discover the data, the database structure (models and tables) is dynamically created by the parser but this uncertainty forces the parser to have some drawbacks (e.g. assuming as every column to be of type string/varchar) 
