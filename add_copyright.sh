#!/bin/sh

COPYRIGHT="    Copyright 2018,2019 Austin Haigh

    This file is part of MCIGN.

    MCIGN is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    MCIGN is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with MCIGN.  If not, see <https://www.gnu.org/licenses/>."

TMP="/tmp/copyright_`date +%s`.txt"

for file in `find $1 -type f -name \*.html`
do
	echo $file
	echo "<!--" > $TMP
	echo "$COPYRIGHT" >> $TMP
	echo "
-->

" >> $TMP
	cat $file >> $TMP
	cat $TMP > $file
done

for file in `find $1 -type f -name \*.ts -o -name \*.scss`
do
	echo $file
	echo "/*" > $TMP
	echo "$COPYRIGHT" >> $TMP
	echo "
*/

" >> $TMP
	cat $file >> $TMP
	cat $TMP > $file
done

rm $TMP
